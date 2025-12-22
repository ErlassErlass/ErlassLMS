
import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

const CURRICULUM_DATA = [
  {
    category: "PYTHON PROGRAMMING",
    slug: "python-programming",
    courses: [
      { title: "Python Explorer: Journey to Digital Creativity for Teens", level: "SMP", scenario: "PROJECT" },
      { title: "Python Mastery: From Zero to Hero in 12 Sessions", level: "SMA", scenario: "COMPETENCY" }
    ]
  },
  {
    category: "WEB DEVELOPMENT",
    slug: "web-development",
    courses: [
      { title: "HTML-CSS-Javascript: Membangun Website Pertamamu", level: "SMP-SMA", scenario: "PROJECT" }
    ]
  },
  {
    category: "VISUAL PROGRAMMING",
    slug: "visual-programming",
    courses: [
      { title: "Projek Coding Scratch", level: "SD", scenario: "TRADITIONAL" },
      { title: "Kurikulum 20 PTM Coding Scratch", level: "SD", scenario: "BLENDED" },
      { title: "Blockly: Programming dengan Blok", level: "SMP", scenario: "SELF_PACED" }
    ]
  },
  {
    category: "CHATBOT & AI",
    slug: "chatbot-ai",
    courses: [
      { title: "Chatbot AI Dasar: Rule-Based Systems", level: "SMP", scenario: "TRADITIONAL" },
      { title: "Chatbot AI Lanjutan: Natural Language Processing", level: "SMA", scenario: "PROJECT" },
      { title: "Pictoblox AI: Pemrograman Visual dengan AI", level: "SD-SMP", scenario: "VISUAL" }
    ]
  },
  {
    category: "ROBOTICS",
    slug: "robotics",
    courses: [
      { title: "Micro:bit Learning Kit - Dasar", level: "SD", scenario: "BLENDED" },
      { title: "Micro:bit Learning Kit - Menengah", level: "SMP", scenario: "BLENDED" },
      { title: "Jimu Trackbit: Robotika Kreatif", level: "SD-SMP", scenario: "PROJECT" }
    ]
  },
  {
    category: "MATEMATIKA & AKADEMIK",
    slug: "mathematics",
    courses: [
      { title: "Matematika itu Asyik - Dasar", level: "SD Kelas 1-2", scenario: "TRADITIONAL" },
      { title: "Matematika itu Asyik - Menengah", level: "SD Kelas 3-4", scenario: "TRADITIONAL" },
      { title: "Matematika itu Asyik - Lanjutan", level: "SD Kelas 5-6", scenario: "TRADITIONAL" }
    ]
  },
  {
    category: "DIGITAL LITERACY",
    slug: "digital-literacy",
    courses: [
      { title: "Kecakapan Digital Abad 21 - Dasar", level: "SD", scenario: "COLLABORATIVE" },
      { title: "Kecakapan Digital Abad 21 - Menengah", level: "SMP", scenario: "COLLABORATIVE" },
      { title: "Kecakapan Digital Abad 21 - Lanjutan", level: "SMA", scenario: "COLLABORATIVE" }
    ]
  },
  {
    category: "CREATIVE TOOLS",
    slug: "creative-tools",
    courses: [
      { title: "Canva & AI: Desain Kreatif dengan Kecerdasan Buatan", level: "SMP-SMA", scenario: "PROJECT" }
    ]
  },
  {
    category: "ASSESMEN & TES",
    slug: "assessments",
    courses: [
      { title: "Assesmen Kompetensi Minimum - Literasi Level 1", level: "SD", scenario: "COMPETENCY" },
      { title: "Assesmen Kompetensi Minimum - Numerasi Level 1", level: "SD", scenario: "COMPETENCY" },
      { title: "Assesmen Kompetensi Minimum - Literasi Level 2", level: "SMP", scenario: "COMPETENCY" },
      { title: "Assesmen Kompetensi Minimum - Numerasi Level 2", level: "SMP", scenario: "COMPETENCY" },
      { title: "Tes Potensi Akademik - Dasar", level: "SMP", scenario: "TRADITIONAL" },
      { title: "Tes Potensi Akademik - Lanjutan", level: "SMA", scenario: "TRADITIONAL" }
    ]
  }
]

async function main() {
  console.log("🚀 Starting Curriculum V2 Seed...")

  // 1. Get Admin
  const admin = await prisma.user.findFirst({ where: { role: 'SUPERADMIN' } })
  if (!admin) {
    console.error("❌ No SUPERADMIN found. Run basic seed first.")
    process.exit(1)
  }

  // 2. Clear previous simulation courses (Optional, but cleaner)
  // const deleted = await prisma.course.deleteMany({ where: { createdById: admin.id } })
  // console.log(`Deleted ${deleted.count} old courses...`)

  // 3. Create Categories & Courses
  for (const group of CURRICULUM_DATA) {
    console.log(`Processing Category: ${group.category}...`)
    
    const category = await prisma.courseCategory.upsert({
      where: { slug: group.slug },
      update: { name: group.category },
      create: { name: group.category, slug: group.slug }
    })

    for (const courseData of group.courses) {
      await prisma.course.create({
        data: {
          title: courseData.title,
          description: `Kursus ${courseData.level} dengan metode ${courseData.scenario}`,
          category: group.category,
          categoryId: category.id,
          level: courseData.level,
          price: 0, // Default Free for now
          isPremium: false,
          isPublished: true,
          createdById: admin.id,
          learningScenario: courseData.scenario,
          
          // Add default section
          sections: {
            create: {
              title: "Pendahuluan",
              description: "Pengantar Materi",
              orderIndex: 0,
              content: "<p>Selamat datang di kursus ini.</p>",
              isFree: true
            }
          }
        }
      })
    }
  }

  console.log("✅ Curriculum Seed Completed!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
