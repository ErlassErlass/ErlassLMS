// scripts/populate-courses.ts - script to populate database with sample courses
import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

// Import sample data - need to import the data differently since this is outside src
const sampleCourses = [
  {
    id: "1",
    title: "Scratch Dasar - Membuat Game Pertamamu",
    description: "Belajar pemrograman visual dengan Scratch melalui pembuatan game sederhana. Cocok untuk pemula usia 8-12 tahun.",
    category: "scratch",
    level: "beginner",
    price: 0,
    isPremium: false,
    freeSections: 5,
    totalSections: 8,
    coverImage: "/images/scratch-basic.jpg",
    sections: [
      {
        id: "1-1",
        title: "Pengenalan Scratch dan Interface",
        description: "Mengenal blok-blok pemrograman dan area kerja Scratch",
        content: "Scratch adalah bahasa pemrograman visual yang dikembangan oleh MIT...",
        videoUrl: "https://example.com/videos/scratch-intro.mp4",
        orderIndex: 1,
        isFree: true,
        estimatedDuration: 15
      },
      {
        id: "1-2", 
        title: "Gerakan dan Animasi Sederhana",
        description: "Membuat karakter bergerak dan beranimasi",
        content: "Kita akan belajar menggunakan blok motion untuk menggerakkan sprite...",
        videoUrl: "https://example.com/videos/scratch-movement.mp4",
        orderIndex: 2,
        isFree: true,
        estimatedDuration: 20
      },
      // ... more sections
    ]
  },
  {
    id: "2",
    title: "Pictoblox AI - Robotika Virtual",
    description: "Memprogram AI dan robotika dengan Pictoblox. Pelajari machine learning sederhana.",
    category: "pictoblox",
    level: "intermediate", 
    price: 199000,
    isPremium: true,
    freeSections: 3,
    totalSections: 10,
    coverImage: "/images/pictoblox-ai.jpg"
  }
];

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
          published: true,
          // For this example, we'll use a placeholder user ID
          // In a real application, you would have an actual admin user ID
          createdById: 'clz1234567890' // You should replace this with an actual user ID
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