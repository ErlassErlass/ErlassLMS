
import { PrismaClient } from '@prisma/client'
import { generateId } from '../src/lib/id-generator'

const prisma = new PrismaClient()

const LEVEL_BADGES = [
  { level: 10, name: "Hello World", slug: "lvl-10-hello-world", icon: "👶", desc: "Langkah pertama dalam perjalanan coding." },
  { level: 20, name: "Script Kiddie", slug: "lvl-20-script-kiddie", icon: "💻", desc: "Mulai lancar menulis script otomasi." },
  { level: 30, name: "Bug Squash", slug: "lvl-30-bug-squash", icon: "🐛", desc: "Tidak ada error yang bisa sembunyi darimu." },
  { level: 40, name: "Git Master", slug: "lvl-40-git-master", icon: "🌿", desc: "Cabang kode (branch) tunduk padamu." },
  { level: 50, name: "Code Architect", slug: "lvl-50-architect", icon: "🏛️", desc: "Membangun fondasi sistem yang kokoh." },
  { level: 60, name: "Full Stack Hero", slug: "lvl-60-fullstack", icon: "🥞", desc: "Menguasai frontend dan backend sekaligus." },
  { level: 70, name: "System Overlord", slug: "lvl-70-overlord", icon: "🔌", desc: "Server dan infrastruktur ada di genggaman." },
  { level: 80, name: "AI Whisperer", slug: "lvl-80-ai", icon: "🤖", desc: "Berbicara bahasa mesin dan AI." },
  { level: 90, name: "Quantum Coder", slug: "lvl-90-quantum", icon: "⚛️", desc: "Menulis kode di dimensi kuantum." },
  { level: 100, name: "God of Code", slug: "lvl-100-god", icon: "👑", desc: "Penguasa Mutlak Semesta Digital. LEGEND." }
]

async function main() {
  console.log("🚀 Seeding Level Badges (Raw SQL)...")

  // 1. Get Admin User
  const users: any[] = await prisma.$queryRaw`SELECT * FROM users WHERE role = 'SUPERADMIN' LIMIT 1`
  let user = users[0]
  
  if (!user) {
     const allUsers: any[] = await prisma.$queryRaw`SELECT * FROM users LIMIT 1`
     user = allUsers[0]
  }

  if (!user) {
      console.error("❌ No user found.")
      return
  }
  console.log(`👤 Granting to: ${user.name}`)

  // 2. Insert Badges and Grant to User
  for (const b of LEVEL_BADGES) {
    const badgeId = generateId('badge')
    
    // Upsert Badge
    // Check if exists first (to get ID if exists)
    const existing: any[] = await prisma.$queryRaw`SELECT * FROM badges WHERE slug = ${b.slug}`
    let targetBadgeId = badgeId

    if (existing.length === 0) {
        await prisma.$executeRaw`
            INSERT INTO badges (id, name, slug, description, "imageUrl", category, "xpReward", "criteriaType", "criteriaValue")
            VALUES (${badgeId}, ${b.name}, ${b.slug}, ${b.desc}, ${b.icon}, 'Level', 0, 'XP_MILESTONE', ${b.level.toString()})
        `
        console.log(`✅ Created Badge: ${b.name}`)
    } else {
        targetBadgeId = existing[0].id
        console.log(`ℹ️ Badge ${b.name} exists.`)
    }

    // Grant Badge to User
    const userBadgeId = generateId('userBadge')
    try {
        await prisma.$executeRaw`
            INSERT INTO user_badges (id, "userId", "badgeId", "earnedAt")
            VALUES (${userBadgeId}, ${user.id}, ${targetBadgeId}, NOW())
            ON CONFLICT ("userId", "badgeId") DO NOTHING
        `
    } catch (e) {
        // Ignore unique constraint
    }
  }

  console.log("🎉 All Level Badges Granted!")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
