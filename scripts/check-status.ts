
import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  const challengeCount = await prisma.challenge.count()
  const dailyQuestCount = await prisma.dailyQuest.count()
  const courseCount = await prisma.course.count()
  const userCount = await prisma.user.count()

  console.log(`
    📊 Database Status Check:
    - Users: ${userCount}
    - Courses: ${courseCount}
    - Challenges: ${challengeCount}
    - Daily Quests: ${dailyQuestCount}
  `)
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
