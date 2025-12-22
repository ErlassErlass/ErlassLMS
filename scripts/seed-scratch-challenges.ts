
import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

const SCRATCH_CHALLENGES = [
    {
        title: "Animasi Kucing Terbang",
        category: "scratch",
        difficulty: "Easy",
        points: 100,
        type: "GAME", // Scratch projects are visual/games
        instructions: "Buat animasi sederhana di mana Sprite Kucing bergerak dari kiri ke kanan sambil berganti kostum seolah-olah sedang terbang.",
        description: "Belajar gerakan dasar dan animasi frame-by-frame di Scratch.",
        starterCode: null, // Scratch uses external editor
        expectedOutput: "Kucing bergerak mulus dari x:-200 ke x:200",
        gameConfig: null
    },
    {
        title: "Game Tangkap Apel",
        category: "scratch",
        difficulty: "Medium",
        points: 200,
        type: "GAME",
        instructions: "Buat game di mana mangkuk (Bowl) bisa digerakkan dengan panah kiri/kanan untuk menangkap Apel yang jatuh dari atas. Setiap apel tertangkap, skor bertambah 1.",
        description: "Logika game sederhana: Input user, deteksi tabrakan (collision), dan variabel skor.",
        starterCode: null,
        expectedOutput: "Skor bertambah saat mangkuk menyentuh apel",
        gameConfig: null
    },
    {
        title: "Interaksi Suara Hewan",
        category: "scratch",
        difficulty: "Easy",
        points: 150,
        type: "STANDARD", // Can be standard too, logic focus
        instructions: "Tambahkan 3 hewan berbeda. Ketika masing-masing hewan diklik, mereka harus mengeluarkan suara yang sesuai.",
        description: "Event handling: 'When this sprite clicked'.",
        starterCode: null,
        expectedOutput: "Suara keluar saat sprite diklik",
        gameConfig: null
    }
]

async function main() {
  console.log('😺 Seeding Scratch Challenges...')

  // Ensure Category Exists
  await prisma.courseCategory.upsert({
      where: { slug: 'scratch' },
      update: {},
      create: {
          name: 'Scratch',
          slug: 'scratch',
          description: 'Visual programming language for beginners'
      }
  })

  // Get a course to link (Soft Link)
  const course = await prisma.course.findFirst({
      where: { category: { contains: 'scratch', mode: 'insensitive' } }
  })

  for (const item of SCRATCH_CHALLENGES) {
      const exists = await prisma.challenge.findFirst({
          where: { title: item.title }
      })

      if (!exists) {
          await prisma.challenge.create({
              data: {
                  title: item.title,
                  category: item.category,
                  difficulty: item.difficulty,
                  points: item.points,
                  type: item.type,
                  instructions: item.instructions,
                  description: item.description,
                  expectedOutput: item.expectedOutput,
                  published: true,
                  relatedCourseId: course?.id
              }
          })
          console.log(`   + Created: ${item.title}`)
      } else {
          console.log(`   . Skipped: ${item.title}`)
      }
  }

  console.log('✅ Scratch Challenges Seeded.')
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
