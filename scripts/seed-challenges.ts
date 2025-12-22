
import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

const CHALLENGE_DATA = [
  {
    title: "Python Hello World",
    category: "python",
    difficulty: "Easy",
    points: 100,
    type: "STANDARD",
    instructions: "Buat program Python yang mencetak teks 'Hello World' ke layar.",
    starterCode: "# Tulis kodemu di sini\n",
    expectedOutput: "Hello World",
    relatedCourseTitle: "Python Explorer: Journey to Digital Creativity for Teens"
  },
  {
    title: "Variabel & Tipe Data",
    category: "python",
    difficulty: "Easy",
    points: 150,
    type: "STANDARD",
    instructions: "Buat variabel `nama` berisi 'Budi' dan `umur` berisi 15. Lalu print: 'Nama saya Budi, umur 15'.",
    starterCode: "# Variable Assignment\n",
    expectedOutput: "Nama saya Budi, umur 15",
    relatedCourseTitle: "Python Explorer: Journey to Digital Creativity for Teens"
  },
  {
    title: "Looping Bintang",
    category: "python",
    difficulty: "Medium",
    points: 300,
    type: "STANDARD",
    instructions: "Gunakan loop untuk mencetak 5 baris bintang (*). Baris 1 ada 1 bintang, baris 5 ada 5 bintang.",
    starterCode: "for i in range(1, 6):\n    # Code here",
    expectedOutput: "*\n**\n***\n****\n*****",
    relatedCourseTitle: "Python Mastery: From Zero to Hero in 12 Sessions"
  },
  {
    title: "HTML Struktur Dasar",
    category: "web",
    difficulty: "Easy",
    points: 100,
    type: "STANDARD",
    instructions: "Buat struktur HTML5 dasar dengan tag `html`, `head`, `body`. Di dalam body, buat `h1` bertuliskan 'Website Pertamaku'.",
    starterCode: "<!DOCTYPE html>\n<html>\n  <!-- Code here -->\n</html>",
    expectedOutput: "h1:Website Pertamaku", // Keyword check logic
    relatedCourseTitle: "HTML-CSS-Javascript: Membangun Website Pertamamu"
  },
  {
    title: "Robot Maze Level 1",
    category: "scratch",
    difficulty: "Easy",
    points: 200,
    type: "GAME",
    instructions: "Gerakkan robot ke bendera hijau. Hati-hati jangan menabrak tembok!",
    gameConfig: {
      gridSize: 5,
      start: { x: 0, y: 0 },
      finish: { x: 4, y: 0 },
      obstacles: [{x:1, y:1}, {x:2, y:1}, {x:3, y:1}, {x:1, y:0}]
    },
    relatedCourseTitle: "Projek Coding Scratch"
  }
]

async function main() {
  console.log("🚀 Seeding Challenges...")

  for (const item of CHALLENGE_DATA) {
    // Find related course
    const course = await prisma.course.findFirst({
        where: { title: { contains: item.relatedCourseTitle } }
    })

    await prisma.challenge.create({
        data: {
            title: item.title,
            category: item.category,
            difficulty: item.difficulty,
            points: item.points,
            type: item.type,
            instructions: item.instructions,
            starterCode: item.starterCode,
            expectedOutput: item.expectedOutput,
            gameConfig: item.gameConfig || undefined,
            relatedCourseId: course?.id,
            published: true,
            description: `Tantangan untuk materi ${item.relatedCourseTitle}`
        }
    })
  }

  console.log(`✅ Created ${CHALLENGE_DATA.length} Challenges.`)
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
