
import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log("⚡ Granting God Mode (All Access) to Super Admin...")

  const admin = await prisma.user.findFirst({ where: { role: 'SUPERADMIN' } })
  if (!admin) {
    console.error("❌ No SUPERADMIN found.")
    process.exit(1)
  }

  console.log(`Target Admin: ${admin.email}`)

  // 1. Enroll in ALL Courses
  const allCourses = await prisma.course.findMany()
  let enrollCount = 0
  for (const course of allCourses) {
    const exists = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: admin.id, courseId: course.id } }
    })
    
    if (!exists) {
      await prisma.enrollment.create({
        data: {
          userId: admin.id,
          courseId: course.id,
          status: 'COMPLETED',
          progressPercentage: 100,
          completedAt: new Date()
        }
      })
      enrollCount++
    }
  }
  console.log(`✅ Enrolled in ${enrollCount} new courses (Total: ${allCourses.length})`)

  // 2. Award ALL Badges
  const allBadges = await prisma.badge.findMany()
  let badgeCount = 0
  for (const badge of allBadges) {
    try {
      await prisma.userBadge.create({
        data: {
          userId: admin.id,
          badgeId: badge.id
        }
      })
      badgeCount++
    } catch (e) {
      // Ignore unique constraint error if already has badge
    }
  }
  console.log(`✅ Awarded ${badgeCount} new badges (Total: ${allBadges.length})`)

  // 3. Max Out XP
  await prisma.user.update({
    where: { id: admin.id },
    data: {
      xp: 999999,
      level: 100,
      currentStreak: 365
    }
  })
  console.log("✅ XP Maxed out to Level 100")

}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
