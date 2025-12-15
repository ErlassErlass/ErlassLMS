// scripts/populate-courses.ts - script to populate database with sample courses
import { prisma } from '@/lib/db';
import { sampleCourses } from '@/lib/course-data';

async function populateCourses() {
  console.log('Starting to populate sample courses...');
  
  try {
    // Check if courses already exist to avoid duplicates
    const existingCourse = await prisma.course.findFirst({
      where: { 
        id: sampleCourses[0].id 
      }
    });
    
    if (existingCourse) {
      console.log('Sample courses already exist in the database. Skipping population.');
      return;
    }
    
    for (const courseData of sampleCourses) {
      console.log(`Creating course: ${courseData.title}`);
      
      // Create the course
      const course = await prisma.course.create({
        data: {
          id: courseData.id,
          title: courseData.title,
          description: courseData.description,
          category: courseData.category,
          level: courseData.level,
          price: courseData.price,
          isPremium: courseData.isPremium,
          freeSections: courseData.freeSections,
          totalSections: courseData.totalSections,
          coverImage: courseData.coverImage,
          isPublished: true,
          createdById: 'cm1234567890' // Default admin user ID - you may need to adjust this
        }
      });
      
      console.log(`Created course: ${course.title} with ID: ${course.id}`);
      
      // If the course has sections, create them
      if (courseData.sections && courseData.sections.length > 0) {
        for (const sectionData of courseData.sections) {
          const section = await prisma.courseSection.create({
            data: {
              id: sectionData.id,
              courseId: course.id,
              title: sectionData.title,
              description: sectionData.description,
              content: sectionData.content,
              videoUrl: sectionData.videoUrl,
              orderIndex: sectionData.orderIndex,
              isFree: sectionData.isFree,
              estimatedDuration: sectionData.estimatedDuration
            }
          });
          
          console.log(`  - Created section: ${section.title}`);
        }
      }
    }
    
    console.log('Successfully populated sample courses!');
  } catch (error) {
    console.error('Error populating courses:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Only run this script if called directly (not when imported)
if (require.main === module) {
  populateCourses().catch(console.error);
}

export { populateCourses };