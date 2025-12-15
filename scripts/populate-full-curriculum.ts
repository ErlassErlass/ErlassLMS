import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

const CURRICULUM_DATA = [
  {
    category: "Python Programming",
    slug: "python-programming",
    description: "Belajar bahasa pemrograman Python dari dasar hingga mahir.",
    courses: [
      { title: "[SMP] Python Explorer: Journey to Digital Creativity for Teens", level: "Intermediate" },
      { title: "[SMA] Python Mastery: From Zero to Hero in 12 Sessions", level: "Advanced" }
    ]
  },
  {
    category: "Web Development",
    slug: "web-development",
    description: "Membangun website modern dengan teknologi terkini.",
    courses: [
      { title: "[SMP-SMA] HTML-CSS-Javascript: Membangun Website Pertamamu", level: "Intermediate" }
    ]
  },
  {
    category: "Visual Programming",
    slug: "visual-programming",
    description: "Pemrograman visual interaktif untuk pemula.",
    courses: [
      { title: "[SD] Projek Coding Scratch", level: "Beginner" },
      { title: "[SD] Kurikulum 20 PTM Coding Scratch", level: "Beginner" },
      { title: "[SMP] Blockly: Programming dengan Blok", level: "Intermediate" }
    ]
  },
  {
    category: "Chatbot & AI",
    slug: "chatbot-ai",
    description: "Eksplorasi kecerdasan buatan dan pembuatan chatbot.",
    courses: [
      { title: "[SMP] Chatbot AI Dasar: Rule-Based Systems", level: "Intermediate" },
      { title: "[SMA] Chatbot AI Lanjutan: Natural Language Processing", level: "Advanced" },
      { title: "[SD-SMP] Pictoblox AI: Pemrograman Visual dengan AI", level: "Beginner" }
    ]
  },
  {
    category: "Robotics",
    slug: "robotics",
    description: "Belajar merakit dan memprogram robot.",
    courses: [
      { title: "[SD] Micro:bit Learning Kit - Dasar", level: "Beginner" },
      { title: "[SMP] Micro:bit Learning Kit - Menengah", level: "Intermediate" },
      { title: "[SD-SMP] Jimu Trackbit: Robotika Kreatif", level: "Beginner" }
    ]
  },
  {
    category: "Matematika & Akademik",
    slug: "matematika-akademik",
    description: "Pengayaan materi akademik sekolah.",
    courses: [
      { title: "[SD Kelas 1-2] Matematika itu Asyik - Dasar", level: "Beginner" },
      { title: "[SD Kelas 3-4] Matematika itu Asyik - Menengah", level: "Intermediate" },
      { title: "[SD Kelas 5-6] Matematika itu Asyik - Lanjutan", level: "Advanced" }
    ]
  },
  {
    category: "Digital Literacy",
    slug: "digital-literacy",
    description: "Kecakapan digital untuk abad 21.",
    courses: [
      { title: "[SD] Kecakapan Digital Abad 21 - Dasar", level: "Beginner" },
      { title: "[SMP] Kecakapan Digital Abad 21 - Menengah", level: "Intermediate" },
      { title: "[SMA] Kecakapan Digital Abad 21 - Lanjutan", level: "Advanced" }
    ]
  },
  {
    category: "Creative Tools",
    slug: "creative-tools",
    description: "Desain dan kreativitas digital.",
    courses: [
      { title: "[SMP-SMA] Canva & AI: Desain Kreatif dengan Kecerdasan Buatan", level: "Intermediate" }
    ]
  },
  {
    category: "Assesmen & Tes",
    slug: "assesmen-tes",
    description: "Persiapan ujian dan tes potensi akademik.",
    courses: [
      // Assuming generic placeholder if not specified, or leave empty category
    ]
  }
]

async function main() {
  console.log("Mulai memetakan kurikulum...")

  // Get Admin ID for 'createdById'
  const admin = await prisma.user.findFirst({ where: { role: 'SUPERADMIN' } })
  if (!admin) {
    console.error("Admin user not found. Please seed basic users first.")
    return
  }

  for (const catData of CURRICULUM_DATA) {
    console.log(`Processing Category: ${catData.category}`)

    // 1. Upsert Category
    const category = await prisma.courseCategory.upsert({
      where: { slug: catData.slug },
      update: { name: catData.category, description: catData.description },
      create: {
        name: catData.category,
        slug: catData.slug,
        description: catData.description
      }
    })

    // 2. Create Courses
    for (const courseData of catData.courses) {
      // Check if course exists to avoid duplicates
      const existingCourse = await prisma.course.findFirst({
        where: { title: courseData.title }
      })

      if (!existingCourse) {
        await prisma.course.create({
          data: {
            title: courseData.title,
            description: `Materi pembelajaran lengkap untuk ${courseData.title}.`,
            category: category.name, // Legacy field
            categoryId: category.id, // Relation field
            level: courseData.level,
            price: 150000, // Default price
            isPremium: true,
            isPublished: true,
            createdById: admin.id,
            // Create 3 dummy sections for structure
            sections: {
              create: [
                { title: "Pendahuluan", description: "Pengantar materi", orderIndex: 0, isFree: true, content: "Selamat datang di kursus ini..." },
                { title: "Materi Inti", description: "Pembahasan utama", orderIndex: 1, isFree: false, content: "Materi inti..." },
                { title: "Proyek Akhir", description: "Implementasi materi", orderIndex: 2, isFree: false, content: "Proyek..." },
              ]
            }
          }
        })
        console.log(`  + Created Course: ${courseData.title}`)
      } else {
        console.log(`  = Course exists: ${courseData.title}`)
      }
    }
  }

  console.log("✅ Pemetaan Kurikulum Selesai!")
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
