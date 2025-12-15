
import { PrismaClient } from '@prisma/client'
import { generateId } from '../src/lib/id-generator'

const prisma = new PrismaClient()

async function main() {
  console.log("🚀 Starting God Mode Grant Process (RAW SQL MODE)...")

  // 1. Find User
  const users: any[] = await prisma.$queryRaw`SELECT * FROM users WHERE role = 'SUPERADMIN' LIMIT 1`
  let user = users[0]

  if (!user) {
    const allUsers: any[] = await prisma.$queryRaw`SELECT * FROM users LIMIT 1`
    user = allUsers[0]
  }

  if (!user) {
    console.error("❌ No users found.")
    return
  }

  console.log(`👤 Target User: ${user.name} (${user.id})`)

  // 2. Update Level
  await prisma.$executeRaw`UPDATE users SET level = 100, xp = 1000000 WHERE id = ${user.id}`
  console.log("✅ Level set to 100.")

  // 3. Badges
  // Check if badges exist
  const badges: any[] = await prisma.$queryRaw`SELECT * FROM badges`
  
  if (badges.length === 0) {
    console.log("⚠️ No badges found. Seeding defaults...")
    const defaultBadges = [
        { name: "Early Adopter", slug: "early-adopter", description: "Pengguna awal", imageUrl: "🚀", category: "Achievement" },
        { name: "Code Ninja", slug: "code-ninja", description: "Master algoritma", imageUrl: "🥷", category: "Challenge" }
    ]
    for (const b of defaultBadges) {
        const id = generateId('badge')
        await prisma.$executeRaw`
            INSERT INTO badges (id, name, slug, description, "imageUrl", category, "xpReward", "criteriaType")
            VALUES (${id}, ${b.name}, ${b.slug}, ${b.description}, ${b.imageUrl}, ${b.category}, 0, 'MANUAL')
            ON CONFLICT (slug) DO NOTHING
        `
    }
  }

  const allBadges: any[] = await prisma.$queryRaw`SELECT * FROM badges`
  for (const b of allBadges) {
    const id = generateId('userBadge')
    // Postgres ON CONFLICT requires the constraint name or columns
    // Assuming unique constraint is on (userId, badgeId)
    try {
        await prisma.$executeRaw`
            INSERT INTO user_badges (id, "userId", "badgeId", "earnedAt")
            VALUES (${id}, ${user.id}, ${b.id}, NOW())
            ON CONFLICT ("userId", "badgeId") DO NOTHING
        `
    } catch (e) { console.log("Skip badge " + b.name) }
  }
  console.log("✅ Badges granted.")

  // 4. Certificates (Courses)
  const courses: any[] = await prisma.$queryRaw`SELECT * FROM courses`
  for (const c of courses) {
    const random = Math.floor(1000 + Math.random() * 9000)
    const serial = `ERL-${new Date().getFullYear()}-CRS-${c.id.substring(0,4).toUpperCase()}-${random}`
    const id = generateId('certificate')
    const metadata = JSON.stringify({ grade: 'A+' })
    
    // Check if exists
    const exists: any[] = await prisma.$queryRaw`SELECT * FROM certificates WHERE "userId" = ${user.id} AND "courseId" = ${c.id}`
    if (exists.length === 0) {
        await prisma.$executeRaw`
            INSERT INTO certificates (id, "userId", type, "courseId", "serialNumber", "issuedAt", metadata)
            VALUES (${id}, ${user.id}, 'COURSE', ${c.id}, ${serial}, NOW(), ${metadata}::jsonb)
        `
    }
  }
  console.log("✅ Course Certificates granted.")

    // 5. Certificates (Challenges)
  const challenges: any[] = await prisma.$queryRaw`SELECT * FROM challenges`
  for (const c of challenges) {
    const random = Math.floor(1000 + Math.random() * 9000)
    const serial = `ERL-${new Date().getFullYear()}-CHG-${c.id.substring(0,4).toUpperCase()}-${random}`
    const id = generateId('certificate')
    const metadata = JSON.stringify({ score: 100 })
    
    const exists: any[] = await prisma.$queryRaw`SELECT * FROM certificates WHERE "userId" = ${user.id} AND "challengeId" = ${c.id}`
    if (exists.length === 0) {
        await prisma.$executeRaw`
            INSERT INTO certificates (id, "userId", type, "challengeId", "serialNumber", "issuedAt", metadata)
            VALUES (${id}, ${user.id}, 'CHALLENGE', ${c.id}, ${serial}, NOW(), ${metadata}::jsonb)
        `
    }
  }
  console.log("✅ Challenge Certificates granted.")

  console.log("🎉 GOD MODE ENABLED (RAW SQL)!")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
