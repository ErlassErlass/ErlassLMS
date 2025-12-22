
import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log("☀️ Seeding Daily Quests for All Users...")

  const users = await prisma.user.findMany({ select: { id: true } })
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const QUEST_TEMPLATES = [
    { type: 'LOGIN', description: 'Login ke Platform', xpReward: 50 },
    { type: 'READ_MATERIAL', description: 'Baca 1 Materi', xpReward: 100 },
    { type: 'COMPLETE_QUIZ', description: 'Selesaikan 1 Kuis', xpReward: 150 }
  ]

  let count = 0
  for (const user of users) {
    for (const template of QUEST_TEMPLATES) {
        try {
            await prisma.dailyQuest.create({
                data: {
                    userId: user.id,
                    date: today,
                    type: template.type,
                    description: template.description,
                    xpReward: template.xpReward,
                    isClaimed: false,
                    progress: 0,
                    target: 1
                }
            })
            count++
        } catch (e) {
            // Ignore duplicates
        }
    }
  }

  console.log(`✅ Created ${count} Daily Quest records.`)
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
