import { prisma } from '@/lib/db';
import { sampleCourses } from '@/lib/course-data';

// Get all courses with optional filtering
export async function getCourses(limit?: number, filter?: { category?: string; level?: string; isPremium?: boolean }) {
  try {
    const whereClause: any = { published: true };
    
    if (filter?.category) whereClause.category = filter.category;
    if (filter?.level) whereClause.level = filter.level;
    if (filter?.isPremium !== undefined) whereClause.isPremium = filter.isPremium;
    
    const courses = await prisma.course.findMany({
      where: whereClause,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        sections: {
          orderBy: { orderIndex: 'asc' },
          take: 1 // Just get the first section to show preview
        }
      },
      take: limit
    });

    return courses;
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw new Error('Failed to fetch courses');
  }
}

// Get a single course by ID
export async function getCourse(courseId: string) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        sections: {
          orderBy: { orderIndex: 'asc' }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        enrollments: true
      }
    });

    return course;
  } catch (error) {
    console.error('Error fetching course:', error);
    throw new Error('Failed to fetch course');
  }
}

// Get course sections by course ID
export async function getCourseSections(courseId: string) {
  try {
    const sections = await prisma.courseSection.findMany({
      where: { courseId },
      orderBy: { orderIndex: 'asc' }
    });

    return sections;
  } catch (error) {
    console.error('Error fetching course sections:', error);
    throw new Error('Failed to fetch course sections');
  }
}

// Get a single course section by ID
export async function getCourseSection(sectionId: string) {
  try {
    const section = await prisma.courseSection.findUnique({
      where: { id: sectionId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            isPremium: true,
          }
        },
        progress: true,
        quizzes: {
          include: {
            questions: {
              include: {
                options: true
              }
            }
          }
        }
      }
    });

    return section;
  } catch (error) {
    console.error('Error fetching course section:', error);
    throw new Error('Failed to fetch course section');
  }
}

// Enroll a user in a course
export async function enrollInCourse(userId: string, courseId: string, mentorId?: string) {
  try {
    // Check if user is already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      }
    });

    if (existingEnrollment) {
      throw new Error('User is already enrolled in this course');
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId,
        mentorId: mentorId || undefined
      },
      include: {
        user: true,
        course: true,
        mentor: true
      }
    });

    return enrollment;
  } catch (error) {
    console.error('Error enrolling in course:', error);
    throw new Error('Failed to enroll in course');
  }
}

// Get user's enrollment for a specific course
export async function getUserEnrollment(userId: string, courseId: string) {
  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      },
      include: {
        user: true,
        course: true,
        mentor: true
      }
    });

    return enrollment;
  } catch (error) {
    console.error('Error fetching user enrollment:', error);
    throw new Error('Failed to fetch user enrollment');
  }
}

// Get all user enrollments
export async function getUserEnrollments(userId: string) {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            sections: true
          }
        },
        mentor: true
      },
      orderBy: { enrolledAt: 'desc' }
    });

    return enrollments;
  } catch (error) {
    console.error('Error fetching user enrollments:', error);
    throw new Error('Failed to fetch user enrollments');
  }
}

// Update user progress in a course section
export async function updateSectionProgress(userId: string, sectionId: string, courseId: string, completed: boolean, timeSpent?: number, quizScore?: number) {
  try {
    // Check if progress record already exists
    const existingProgress = await prisma.userProgress.findUnique({
      where: {
        userId_sectionId: {
          userId,
          sectionId
        }
      }
    });

    let progress;
    if (existingProgress) {
      // Update existing progress
      progress = await prisma.userProgress.update({
        where: {
          userId_sectionId: {
            userId,
            sectionId
          }
        },
        data: {
          completed,
          timeSpent: timeSpent !== undefined 
            ? (existingProgress.timeSpent || 0) + timeSpent 
            : existingProgress.timeSpent,
          quizScore,
          completedAt: completed ? new Date() : null
        }
      });
    } else {
      // Create new progress record
      progress = await prisma.userProgress.create({
        data: {
          userId,
          sectionId,
          courseId,
          completed,
          timeSpent,
          quizScore,
          completedAt: completed ? new Date() : null
        }
      });
    }

    // Update overall course progress
    await updateCourseProgress(userId, courseId);

    return progress;
  } catch (error) {
    console.error('Error updating section progress:', error);
    throw new Error('Failed to update section progress');
  }
}

// Update overall course progress
export async function updateCourseProgress(userId: string, courseId: string) {
  try {
    // Get all sections for the course
    const sections = await prisma.courseSection.findMany({
      where: { courseId }
    });

    if (sections.length === 0) {
      return;
    }

    // Get all completed sections for the user in this course
    const completedSections = await prisma.userProgress.count({
      where: {
        userId,
        courseId,
        completed: true
      }
    });

    // Calculate progress percentage
    const progressPercentage = Math.round((completedSections / sections.length) * 100);

    // Update enrollment record with progress
    await prisma.enrollment.update({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      },
      data: {
        progressPercentage,
        completedAt: progressPercentage === 100 ? new Date() : null
      }
    });
  } catch (error) {
    console.error('Error updating course progress:', error);
    throw new Error('Failed to update course progress');
  }
}

// Get user progress for a specific course
export async function getUserCourseProgress(userId: string, courseId: string) {
  try {
    const progress = await prisma.userProgress.findMany({
      where: {
        userId,
        courseId
      },
      include: {
        section: {
          select: {
            id: true,
            title: true,
            orderIndex: true,
            isFree: true
          }
        }
      }
    });

    return progress;
  } catch (error) {
    console.error('Error fetching user course progress:', error);
    throw new Error('Failed to fetch user course progress');
  }
}

// Get user progress for a specific section
export async function getUserSectionProgress(userId: string, sectionId: string) {
  try {
    const progress = await prisma.userProgress.findUnique({
      where: {
        userId_sectionId: {
          userId,
          sectionId
        }
      }
    });

    return progress;
  } catch (error) {
    console.error('Error fetching user section progress:', error);
    throw new Error('Failed to fetch user section progress');
  }
}