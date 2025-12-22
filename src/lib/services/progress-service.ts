// lib/services/progress-service.ts
import { prisma } from "@/lib/db"
import { CertificateService } from "@/lib/services/certificate-service"

export class ProgressService {
  // Update progress ketika section diselesaikan
  static async completeSection(userId: string, sectionId: string, courseId: string, quizScore?: number) {
    const [section, course] = await Promise.all([
      prisma.courseSection.findUnique({
        where: { id: sectionId },
        include: { course: true }
      }),
      prisma.course.findUnique({
        where: { id: courseId },
        include: { sections: { orderBy: { orderIndex: 'asc' } } }
      })
    ])

    if (!section || !course) {
      throw new Error('Section or course not found')
    }

    // Update atau create user progress
    const userProgress = await prisma.userProgress.upsert({
      where: {
        userId_sectionId: {
          userId,
          sectionId
        }
      },
      update: {
        completed: true,
        quizScore,
        completedAt: new Date(),
      },
      create: {
        userId,
        sectionId,
        courseId,
        completed: true,
        quizScore,
        completedAt: new Date(),
      },
    })

    // Hitung progress percentage
    const totalSections = course.sections.length
    const completedSections = await prisma.userProgress.count({
      where: {
        userId,
        courseId,
        completed: true
      }
    })

    const progressPercentage = (completedSections / totalSections) * 100

    // Update enrollment progress
    const nextSection = course.sections.find(s => s.orderIndex === section.orderIndex + 1)
    
    await prisma.enrollment.update({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      },
      data: {
        progressPercentage,
        currentSectionId: nextSection?.id || sectionId // Tetap di section terakhir jika sudah selesai
      }
    })

    // Auto-Issue Certificate if Course Completed
    if (progressPercentage >= 100) {
      await CertificateService.checkAndIssueCourseCertificate(userId, courseId)
    }

    return { userProgress, progressPercentage, completedSections, totalSections }
  }

  // Get user progress untuk course
  static async getUserCourseProgress(userId: string, courseId: string) {
    const [enrollment, completedSections, course] = await Promise.all([
      prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId
          }
        },
        include: {
          course: {
            include: {
              sections: {
                orderBy: { orderIndex: 'asc' },
                select: {
                  id: true,
                  title: true,
                  description: true,
                  orderIndex: true,
                  isFree: true,
                  estimatedDuration: true,
                  courseId: true,
                  // SECURITY: Exclude content and videoUrl to prevent IDOR/Unauthorized access to locked content
                  // content: false, 
                  // videoUrl: false,
                  progress: {
                    where: { userId }
                  }
                }
              }
            }
          }
        }
      }),
      prisma.userProgress.count({
        where: {
          userId,
          courseId,
          completed: true
        }
      }),
      prisma.course.findUnique({
        where: { id: courseId },
        select: {
            sections: {
                orderBy: { orderIndex: 'asc' },
                select: { id: true, orderIndex: true }
            }
        }
      })
    ])

    if (!enrollment || !course) {
      return null
    }

    const totalSections = course.sections.length
    const progressPercentage = (completedSections / totalSections) * 100

    // Safe fallback logic
    const currentSectionId = enrollment.currentSectionId
    let currentSection = course.sections.find(s => s.id === currentSectionId)
    
    // If not found (or null), fallback to first section
    if (!currentSection) {
        currentSection = course.sections[0]
    }

    return {
      enrollment,
      progress: {
        percentage: progressPercentage,
        completedSections,
        totalSections,
        // We only return the ID/Order of the current section here, the frontend fetches details separately
        // or uses the list from 'sections' which is now sanitized.
        currentSection
      },
      // Sections list is now sanitized (no content/videoUrl)
      sections: enrollment.course.sections.map((section: any) => ({
        ...section,
        userProgress: section.progress[0] || null
      }))
    }
  }

  // Get all user enrollments dengan progress
  static async getUserEnrollments(userId: string) {
    return await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            sections: {
              orderBy: { orderIndex: 'asc' }
            }
          }
        },
        mentor: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        }
      },
      orderBy: { enrolledAt: 'desc' }
    })
  }
}