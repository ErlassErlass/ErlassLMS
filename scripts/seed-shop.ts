
import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

const SHOP_ITEMS = [
  // --- FRAMES ---
  { 
    name: "Default Frame", 
    description: "Bingkai standar untuk pemula.", 
    cost: 0, 
    type: "FRAME", 
    assetUrl: "border-gray-200", 
    isPremium: false 
  },
  { 
    name: "Neon Green", 
    description: "Energi coding yang menyala.", 
    cost: 500, 
    type: "FRAME", 
    assetUrl: "border-green-400 shadow-[0_0_15px_rgba(74,222,128,0.7)] ring-2 ring-green-200", 
    isPremium: false 
  },
  { 
    name: "Cyber Punk", 
    description: "Estetika masa depan.", 
    cost: 1200, 
    type: "FRAME", 
    assetUrl: "border-yellow-400 border-dashed ring-2 ring-blue-500 shadow-[0_0_10px_#facc15]", 
    isPremium: false 
  },
  { 
    name: "Royal Gold", 
    description: "Kemewahan untuk para juara.", 
    cost: 2500, 
    type: "FRAME", 
    assetUrl: "border-yellow-600 ring-4 ring-yellow-300 shadow-xl bg-gradient-to-br from-yellow-100 to-transparent", 
    isPremium: true 
  },
  { 
    name: "Void Walker", 
    description: "Misterius seperti dark mode.", 
    cost: 5000, 
    type: "FRAME", 
    assetUrl: "border-purple-900 ring-4 ring-gray-900 shadow-[0_0_20px_#581c87] bg-gray-900/30", 
    isPremium: true 
  },
  { 
    name: "Ruby Master", 
    description: "Semerah api semangat belajar.", 
    cost: 3000, 
    type: "FRAME", 
    assetUrl: "border-red-600 ring-2 ring-red-400 shadow-[0_0_15px_#dc2626]", 
    isPremium: false 
  },
  { 
    name: "Ocean Blue", 
    description: "Tenang namun menghanyutkan.", 
    cost: 1500, 
    type: "FRAME", 
    assetUrl: "border-cyan-500 ring-4 ring-blue-400 shadow-lg", 
    isPremium: false 
  },

  // --- TITLES ---
  { name: "Novice", description: "Langkah awal perjalananmu.", cost: 0, type: "TITLE", assetUrl: "Novice", isPremium: false },
  { name: "Code Wizard", description: "Sihir kode ada di jarimu.", cost: 2000, type: "TITLE", assetUrl: "Code Wizard", isPremium: false },
  { name: "Bug Hunter", description: "Pembasmi error profesional.", cost: 1000, type: "TITLE", assetUrl: "Bug Hunter", isPremium: false },
  { name: "Fullstack Hero", description: "Menguasai segalanya.", cost: 5000, type: "TITLE", assetUrl: "Fullstack Hero", isPremium: true },
  { name: "Pixel Artist", description: "Kreatif dengan visual.", cost: 1500, type: "TITLE", assetUrl: "Pixel Artist", isPremium: false },
  { name: "Logic Master", description: "Pemikiran tajam.", cost: 2500, type: "TITLE", assetUrl: "Logic Master", isPremium: false },
]

async function main() {
  console.log("🚀 Seeding Shop Items...")

  for (const item of SHOP_ITEMS) {
    // Check if exists by name to avoid duplicates
    const existing = await prisma.shopItem.findFirst({
        where: { name: item.name }
    })
    
    if (!existing) {
        await prisma.shopItem.create({
            data: {
                name: item.name,
                description: item.description,
                cost: item.cost,
                type: item.type as any, // Enum casting
                assetUrl: item.assetUrl,
                isPremium: item.isPremium
            }
        })
        console.log(`✅ Created Item: ${item.name}`)
    } else {
        // Optional: Update assetUrl if changed in code
        await prisma.shopItem.update({
            where: { id: existing.id },
            data: { 
                assetUrl: item.assetUrl,
                description: item.description,
                cost: item.cost
            }
        })
        console.log(`🔄 Updated Item: ${item.name}`)
    }
  }

  console.log("🎉 Shop Items Seeded!")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
