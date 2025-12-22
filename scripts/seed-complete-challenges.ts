
import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

// --- Data Definitions ---

const CATEGORIES = [
    { name: 'Scratch', slug: 'scratch', description: 'Visual programming for beginners' },
    { name: 'Python', slug: 'python', description: 'Powerful and versatile programming language' },
    { name: 'HTML', slug: 'html', description: 'Structure of the web' },
    { name: 'CSS', slug: 'css', description: 'Styling the web' },
    { name: 'JavaScript', slug: 'javascript', description: 'Interactive web development' },
    { name: 'Game Logic', slug: 'game-logic', description: 'Algorithmic thinking and puzzles' }
]

const CHALLENGES = [
    // --- SCRATCH / GAME LOGIC (Game Mode) ---
    {
        title: "Robot Maze: The Beginning",
        category: "game-logic",
        difficulty: "Easy",
        points: 100,
        type: "GAME",
        instructions: "Bantu robot mencapai bendera hijau! Gunakan blok 'maju', 'belok kiri', atau 'belok kanan'.",
        gameConfig: {
            gridSize: 5,
            start: { x: 0, y: 0 },
            finish: { x: 4, y: 0 },
            obstacles: [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 3, y: 0 }]
        },
        description: "Level 1: Navigasi dasar."
    },
    {
        title: "Robot Maze: Zig Zag",
        category: "game-logic",
        difficulty: "Medium",
        points: 200,
        type: "GAME",
        instructions: "Jalur kali ini berliku. Hati-hati jangan menabrak tembok!",
        gameConfig: {
            gridSize: 6,
            start: { x: 0, y: 0 },
            finish: { x: 5, y: 5 },
            obstacles: [
                { x: 1, y: 0 }, { x: 1, y: 1 }, 
                { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 3, y: 4 },
                { x: 5, y: 4 }
            ]
        },
        description: "Level 2: Pola Zig Zag."
    },

    // --- PYTHON (Standard) ---
    {
        title: "Python: Variable Master",
        category: "python",
        difficulty: "Easy",
        points: 100,
        type: "STANDARD",
        instructions: "Buat variabel `hero_name` dengan nilai 'Gatotkaca' dan `power` dengan nilai 9000. Print keduanya.",
        starterCode: "# Define variables here\n\nprint(hero_name)\nprint(power)",
        expectedOutput: "Gatotkaca\n9000",
        description: "Latihan membuat variabel di Python."
    },
    {
        title: "Python: Even or Odd",
        category: "python",
        difficulty: "Medium",
        points: 200,
        type: "STANDARD",
        instructions: "Buat fungsi `check_number(n)` yang mengembalikan 'Genap' jika n genap, dan 'Ganjil' jika ganjil.",
        starterCode: "def check_number(n):\n    # Tulis logikamu di sini\n    pass\n\nprint(check_number(10))\nprint(check_number(7))",
        expectedOutput: "Genap\nGanjil",
        description: "Logika kondisi if-else."
    },

    // --- HTML (Standard) ---
    {
        title: "HTML: Heading & Paragraph",
        category: "html",
        difficulty: "Easy",
        points: 100,
        type: "STANDARD",
        instructions: "Buat elemen `h1` dengan teks 'Judul' dan `p` dengan teks 'Ini paragraf'.",
        starterCode: "<div>\n  <!-- Tulis kode HTML di sini -->\n</div>",
        expectedOutput: "h1:Judul|p:Ini paragraf", // Simplified keyword check simulation
        description: "Dasar struktur teks HTML."
    },
    {
        title: "HTML: Create a Button",
        category: "html",
        difficulty: "Easy",
        points: 150,
        type: "STANDARD",
        instructions: "Buat tombol HTML dengan teks 'Klik Saya' dan class 'btn-primary'.",
        starterCode: "<!-- Button here -->",
        expectedOutput: "<button class=\"btn-primary\">Klik Saya</button>",
        description: "Membuat elemen interaktif."
    },

    // --- CSS (Standard) ---
    {
        title: "CSS: Red Text",
        category: "css",
        difficulty: "Easy",
        points: 100,
        type: "STANDARD",
        instructions: "Ubah warna teks semua elemen `p` menjadi merah (red).",
        starterCode: "p {\n  /* CSS here */\n}",
        expectedOutput: "color: red",
        description: "Styling dasar text."
    },
    {
        title: "CSS: Flex Center",
        category: "css",
        difficulty: "Medium",
        points: 250,
        type: "STANDARD",
        instructions: "Buat container menjadi flexbox dan pusatkan item di tengah secara horizontal dan vertikal.",
        starterCode: ".container {\n  height: 100vh;\n  /* Add Flexbox rules */\n}",
        expectedOutput: "display: flex|justify-content: center|align-items: center",
        description: "Layouting modern dengan Flexbox."
    }
]

async function main() {
    console.log("🚀 Starting Seed: Complete Challenges & Categories...")

    // 1. Seed Categories
    console.log("\n📦 Seeding Course Categories...")
    for (const cat of CATEGORIES) {
        await prisma.courseCategory.upsert({
            where: { slug: cat.slug },
            update: {
                name: cat.name,
                description: cat.description
            },
            create: {
                name: cat.name,
                slug: cat.slug,
                description: cat.description
            }
        })
    }
    console.log("✅ Categories synced.")

    // 2. Seed Challenges
    console.log("\n⚔️ Seeding Challenges...")
    
    // Optional: Get a default course to link to (just for schema validity if needed, though optional)
    const defaultCourse = await prisma.course.findFirst()

    for (const item of CHALLENGES) {
        // Check if exists to avoid duplicates
        const existing = await prisma.challenge.findFirst({
            where: { title: item.title }
        })

        if (!existing) {
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
                    description: item.description,
                    published: true,
                    // Link to a dummy course if needed for "Soft Selling", else null
                    relatedCourseId: defaultCourse?.id
                }
            })
            console.log(`   + Created: ${item.title} (${item.type})`)
        } else {
            console.log(`   . Skipped (Exists): ${item.title}`)
        }
    }

    console.log("\n🎉 Seed Complete!")
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
