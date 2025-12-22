
import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('🛠️  Fixing Maze Challenge Categories...')

  // Fix Robot Maze 1
  const maze1 = await prisma.challenge.updateMany({
    where: { title: "Robot Maze: The Beginning" },
    data: { category: "game-logic" }
  })
  console.log(`Updated ${maze1.count} challenges for 'The Beginning'.`)

  // Fix Robot Maze 2
  const maze2 = await prisma.challenge.updateMany({
    where: { title: "Robot Maze: Zig Zag" },
    data: { category: "game-logic" }
  })
  console.log(`Updated ${maze2.count} challenges for 'Zig Zag'.`)

  // Fix Level 1 from old seed (seed-challenges.ts) if it exists
  const mazeOld = await prisma.challenge.updateMany({
    where: { title: "Robot Maze Level 1" },
    data: { category: "game-logic" }
  })
  console.log(`Updated ${mazeOld.count} challenges for 'Level 1' (Old Seed).`)

  console.log('✅ Fix Complete.')
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
