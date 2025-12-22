
import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Cleaning up ugly SVG badges...')

  const badges = await prisma.badge.findMany()
  let fixedCount = 0

  for (const badge of badges) {
    if (badge.imageUrl.startsWith('data:image/svg+xml')) {
      // Extract emoji from SVG string
      // Format: ...<text ...>🐛</text>...
      const match = badge.imageUrl.match(/>([^<]+)<\/text>/)
      if (match && match[1]) {
        const emoji = match[1]
        
        await prisma.badge.update({
          where: { id: badge.id },
          data: { imageUrl: emoji }
        })
        
        console.log(`✅ Fixed badge '${badge.name}': SVG -> ${emoji}`)
        fixedCount++
      } else {
        console.warn(`⚠️ Could not extract emoji from badge '${badge.name}'`)
      }
    }
  }

  console.log(`🎉 Cleanup complete. Fixed ${fixedCount} badges.`)
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
