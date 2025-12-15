
import { PrismaClient } from '@prisma/client'
import { generateId } from '../src/lib/id-generator'

const prisma = new PrismaClient()

const SHOP_ITEMS = [
  // FRAMES
  { name: "Default Frame", description: "Standard issue frame.", cost: 0, type: "FRAME", assetUrl: "border-gray-200", isPremium: false },
  { name: "Neon Green", description: "Glowing energy.", cost: 500, type: "FRAME", assetUrl: "border-green-400 shadow-[0_0_15px_rgba(74,222,128,0.7)]", isPremium: false },
  { name: "Cyberpunk", description: "High tech aesthetic.", cost: 1200, type: "FRAME", assetUrl: "border-yellow-400 border-dashed", isPremium: false },
  { name: "Royal Gold", description: "For the elite.", cost: 2500, type: "FRAME", assetUrl: "border-yellow-600 ring-4 ring-yellow-200", isPremium: true },
  { name: "Void Walker", description: "Dark matter infused.", cost: 5000, type: "FRAME", assetUrl: "border-purple-900 bg-gray-900/50", isPremium: true },
  
  // TITLES
  { name: "The Beginner", description: "Starting out.", cost: 100, type: "TITLE", assetUrl: "Novice", isPremium: false },
  { name: "Code Wizard", description: "Magical coding skills.", cost: 2000, type: "TITLE", assetUrl: "Wizard", isPremium: false },
]

async function main() {
  console.log("🚀 Seeding Shop Items (Raw SQL)...")

  for (const item of SHOP_ITEMS) {
    const id = generateId('badge') // Reusing ID generator, prefix doesn't matter too much or I can make a new one. 
    // Actually I should update ID generator for 'shopItem' later.
    // Let's just use 'shp_' + random
    
    // Check if exists
    // We assume name is unique for seeding purpose
    const existing: any[] = await prisma.$queryRaw`SELECT * FROM shop_items WHERE name = ${item.name}`
    
    if (existing.length === 0) {
        const newItemId = `shp_${Math.random().toString(36).substring(2, 15)}`
        await prisma.$executeRaw`
            INSERT INTO shop_items (id, name, description, cost, type, "assetUrl", "isPremium")
            VALUES (${newItemId}, ${item.name}, ${item.description}, ${item.cost}, ${item.type}::"ShopItemType", ${item.assetUrl}, ${item.isPremium})
        `
        console.log(`✅ Created Item: ${item.name}`)
    } else {
        console.log(`ℹ️ Item ${item.name} exists.`)
    }
  }

  console.log("🎉 Shop Items Seeded!")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
