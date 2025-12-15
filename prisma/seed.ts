import { PrismaClient } from '../src/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting basic data seeding...')

  // Check if a basic admin user exists, and create if not
  let adminUser = await prisma.user.findFirst({
    where: {
      email: 'admin@example.com'
    }
  })

  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        name: 'Admin User',
        password: await bcrypt.hash('password123', 10), // Hash the password
        role: 'SUPERADMIN',
        phone: '+6281234567890',
      }
    })
    console.log('Created admin user')
  } else {
    console.log('Admin user already exists')
  }

  // Create a mentor user
  let mentorUser = await prisma.user.findFirst({
    where: {
      email: 'mentor@example.com'
    }
  })

  if (!mentorUser) {
    mentorUser = await prisma.user.create({
      data: {
        email: 'mentor@example.com', 
        name: 'Mentor User',
        password: await bcrypt.hash('password123', 10),
        role: 'MENTOR',
        phone: '+6281234567891',
      }
    })
    
    // Create mentor profile
    await prisma.mentor.create({
      data: {
        userId: mentorUser.id,
        bio: 'Mentor for programming courses',
        hourlyRate: 150000,
        isVerified: true,
      }
    })
    console.log('Created mentor user and profile')
  } else {
    console.log('Mentor user already exists')
  }

  // Create a course for testing
  const course = await prisma.course.create({
    data: {
      title: 'Scratch Dasar - Membuat Game Pertamaku',
      description: 'Belajar pemrograman visual dengan Scratch melalui pembuatan game sederhana.',
      category: 'scratch',
      level: 'beginner',
      price: 0,
      isPublished: true,
      createdById: mentorUser.id,
    },
  })

  // Create sections for the course
  const sections = await Promise.all([
    prisma.courseSection.create({
      data: {
        title: 'Pengenalan Interface Scratch',
        description: 'Mengenal tampilan dan elemen-elemen di Scratch',
        content: 'Scratch adalah platform pemrograman visual dari MIT...',
        orderIndex: 0,
        courseId: course.id,
      }
    }),
    prisma.courseSection.create({
      data: {
        title: 'Gerakan dan Animasi',
        description: 'Membuat objek bergerak dan beranimasi',
        content: 'Untuk membuat objek bergerak, gunakan blok motion...',
        orderIndex: 1,
        courseId: course.id,
      }
    })
  ])

  // Create a quiz for the first section
  const quiz = await prisma.quiz.create({
    data: {
      title: 'Kuis Section 1: Pengenalan Interface Scratch',
      description: 'Uji pemahaman kamu tentang interface Scratch',
      duration: 10,
      maxAttempts: 3,
      isActive: true,
      sectionId: sections[0].id,
      courseId: course.id,
    }
  })

  // Create question bank for the quiz
  const questionBank = await prisma.questionBank.create({
    data: {
      title: "Scratch Dasar - Interface",
      description: "Kumpulan soal untuk memahami interface Scratch",
      category: "scratch",
      difficulty: "easy",
      createdById: mentorUser.id,
    },
  })

  // Add questions to the question bank
  const questions = await Promise.all([
    prisma.question.create({
      data: {
        questionText: "Apa kepanjangan dari Scratch?",
        questionType: "MULTIPLE_CHOICE",
        options: [
          { id: "A", text: "Script Creating Hand" },
          { id: "B", text: "Scratch Coding Helper" },
          { id: "C", text: "Scratch Programming Language" },
          { id: "D", text: "Science and Research Assistant" }
        ],
        correctAnswer: "C",
        explanation: "Scratch adalah sebuah bahasa pemrograman visual",
        points: 10,
        questionBankId: questionBank.id,
      },
    }),
    prisma.question.create({
      data: {
        questionText: "Sprite adalah karakter yang bisa digerakkan dalam Scratch",
        questionType: "TRUE_FALSE", 
        options: [
          { id: "true", text: "Benar" },
          { id: "false", text: "Salah" }
        ],
        correctAnswer: "true",
        explanation: "Sprite adalah objek karakter yang bisa digerakkan dan diprogram",
        points: 10,
        questionBankId: questionBank.id,
      },
    }),
  ])

  // Link questions to quiz
  await Promise.all(
    questions.map((question, index) => 
      prisma.quizQuestion.create({
        data: {
          quizId: quiz.id,
          questionId: question.id,
          order: index + 1,
        },
      })
    )
  )

  // --- Mystery Badges ---
  const mysteryBadge = await prisma.badge.create({
    data: {
      slug: 'konami-code',
      name: 'Hacker Man',
      description: 'Kamu menemukan kode rahasia legendaris!',
      imageUrl: '👾',
      category: 'Easter Egg',
      xpReward: 500
    }
  })

  console.log('Basic data created successfully:')
  console.log('- Admin User: admin@example.com')
  console.log('- Mentor User: mentor@example.com') 
  console.log('- Course:', course.title)
  console.log('- Sections:', sections.length)
  console.log('- Quiz:', quiz.title)
  console.log('- Question Bank:', questionBank.title)
  console.log('- Questions:', questions.length)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })