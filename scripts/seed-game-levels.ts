
import { PrismaClient } from '@prisma/client'
import { generateId } from '../src/lib/id-generator'

const prisma = new PrismaClient()

// Helper to get Admin ID
async function getAdminId() {
    const user = await prisma.user.findFirst({ where: { role: 'SUPERADMIN' } })
    return user ? user.id : null // Fallback if no admin, but usually there is one
}

const GAME_LEVELS = [
    {
        title: "Level 1: Langkah Pertama",
        description: "Gerakkan robot ke bendera. Cukup maju lurus!",
        difficulty: "Beginner",
        points: 50,
        instructions: "Gunakan perintah `move()` berulang kali untuk mencapai bendera merah.",
        gridSize: 5,
        start: { x: 0, y: 2 },
        finish: { x: 4, y: 2 },
        obstacles: [
            { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 },
            { x: 0, y: 3 }, { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 }
        ],
        starterCode: "move()\nmove()"
    },
    {
        title: "Level 2: Belok Kanan",
        description: "Ada tembok di depan! Kamu harus berbelok.",
        difficulty: "Beginner",
        points: 75,
        instructions: "Gunakan `turnRight()` untuk mengubah arah robot ke bawah.",
        gridSize: 5,
        start: { x: 0, y: 1 },
        finish: { x: 2, y: 3 },
        obstacles: [
            { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 }
        ],
        starterCode: "move()\nmove()\nturnRight()\nmove()"
    },
    {
        title: "Level 3: Zig Zag",
        description: "Jalur berliku menantimu.",
        difficulty: "Intermediate",
        points: 100,
        instructions: "Kombinasikan `turnLeft()` dan `turnRight()` untuk melewati rintangan.",
        gridSize: 6,
        start: { x: 0, y: 5 },
        finish: { x: 5, y: 0 },
        obstacles: [
            { x: 1, y: 5 }, { x: 1, y: 4 }, 
            { x: 3, y: 3 }, { x: 3, y: 2 },
            { x: 5, y: 5 }, { x: 4, y: 1 }
        ],
        starterCode: "// Tulis kodemu di sini"
    },
    {
        title: "Level 4: Labirin Buntu",
        description: "Hati-hati memilih jalan.",
        difficulty: "Intermediate",
        points: 150,
        instructions: "Analisis peta sebelum menulis kode. Jangan sampai menabrak tembok!",
        gridSize: 7,
        start: { x: 0, y: 0 },
        finish: { x: 6, y: 6 },
        obstacles: [
            { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 },
            { x: 3, y: 6 }, { x: 3, y: 5 }, { x: 3, y: 4 },
            { x: 5, y: 0 }, { x: 5, y: 1 }, { x: 5, y: 2 }
        ],
        starterCode: ""
    },
    {
        title: "Level 5: The Spiral",
        description: "Ujian terakhir logika spasialmu.",
        difficulty: "Advanced",
        points: 300,
        instructions: "Robot harus berputar masuk ke pusat spiral.",
        gridSize: 7,
        start: { x: 0, y: 0 },
        finish: { x: 3, y: 3 }, // Center
        obstacles: [
            // Spiral Outer
            { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 }, { x: 5, y: 1 },
            { x: 5, y: 2 }, { x: 5, y: 3 }, { x: 5, y: 4 }, { x: 5, y: 5 },
            { x: 4, y: 5 }, { x: 3, y: 5 }, { x: 2, y: 5 }, { x: 1, y: 5 },
            { x: 1, y: 4 }, { x: 1, y: 3 }, { x: 1, y: 2 },
            // Spiral Inner
            { x: 3, y: 2 }
        ],
        starterCode: "// Good luck!"
    }
]

async function main() {
    console.log("🚀 Seeding Game Levels...")
    
    // Create admin user if not exists (fallback)
    let adminId = await getAdminId()
    if (!adminId) {
        console.log("Creating temporary admin for seeding...")
        // Logic to create dummy user omitted for brevity, assuming admin exists from previous steps
    }

    for (const level of GAME_LEVELS) {
        const gameConfig = JSON.stringify({
            gridSize: level.gridSize,
            start: level.start,
            finish: level.finish,
            obstacles: level.obstacles
        })

        const id = generateId('challenge')
        
        // Use Raw Query to bypass Prisma Client validation issues (optional vs required fields)
        await prisma.$executeRaw`
            INSERT INTO challenges (id, title, description, category, difficulty, points, type, instructions, "starterCode", "gameConfig", published, "expectedOutput", "createdAt", "updatedAt")
            VALUES (${id}, ${level.title}, ${level.description}, 'Logic Game', ${level.difficulty}, ${level.points}, 'GAME', ${level.instructions}, ${level.starterCode}, ${gameConfig}::jsonb, true, '', NOW(), NOW())
        `
        console.log(`✅ Created: ${level.title}`)
    }

    console.log("🎉 All Game Levels Seeded!")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
