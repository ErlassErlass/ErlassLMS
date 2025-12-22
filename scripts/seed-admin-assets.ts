
import { PrismaClient } from '../src/generated/prisma'
import { generateId } from '../src/lib/id-generator'

const prisma = new PrismaClient()

// Helper to generate custom ID if id-generator is not available in script context or just use random string
// For seed scripts, we can just use simple string if we are lazy, but let's try to stick to standards if possible.
// Since we can't import src/lib in tsx script easily without build, we'll mock generateId here or try to import.
// We'll use a simple generator here matching standard.
const genId = (prefix: string) => `${prefix}_${Math.random().toString(36).substring(2, 9)}`

async function main() {
  console.log("🏅 Seeding Badges & Certificates for Admin...")

  const adminEmail = "admin@erlass.com"
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } })

  if (!admin) {
    console.error("❌ Admin not found")
    return
  }

  // 1. Create Master Badges (Using Standard Emojis as Images/Icons)
  // Note: Since 'imageUrl' expects a URL, we will use a data URI or a simple emoji text if the frontend supports it.
  // Assuming frontend <img src={badge.imageUrl} />: We need an SVG data URI for the emoji.
  
  const emojiToSvg = (emoji: string) => 
    `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${emoji}</text></svg>`

  const BADGES = [
    { name: "Python Master", slug: "python-master", image: emojiToSvg("🐍"), desc: "Menyelesaikan track Python" },
    { name: "Scratch Wizard", slug: "scratch-wizard", image: emojiToSvg("🧩"), desc: "Ahli visual programming" },
    { name: "AI Pioneer", slug: "ai-explorer", image: emojiToSvg("🤖"), desc: "Menjelajahi dunia AI" },
    { name: "Early Bird", slug: "early-bird", image: emojiToSvg("🌅"), desc: "Bergabung di fase awal" },
    { name: "Bug Hunter", slug: "bug-hunter", image: emojiToSvg("🐛"), desc: "Melaporkan error sistem" }
  ]

  for (const b of BADGES) {
    await prisma.badge.upsert({
      where: { slug: b.slug },
      update: { imageUrl: b.image }, // Update existing badges to use new URL
      create: {
        id: genId('bdg'),
        slug: b.slug,
        name: b.name,
        description: b.desc,
        imageUrl: b.image,
        category: "Achievement",
        criteriaType: "MANUAL",
        xpReward: 100
      }
    })
  }

  // 2. Award Badges to Admin
  const allBadges = await prisma.badge.findMany()
  for (const badge of allBadges) {
    try {
      await prisma.userBadge.create({
        data: {
          id: genId('ubg'),
          userId: admin.id,
          badgeId: badge.id
        }
      })
      console.log(`✅ Awarded badge: ${badge.name}`)
    } catch (e) {
      // Ignore if already has
    }
  }

  // 3. Create Certificates for Admin
  // Fake completed courses
  const courses = await prisma.course.findMany({ take: 3 })
  
  for (const course of courses) {
    try {
        const serial = `CERT-${new Date().getFullYear()}-${course.id.substring(4,8).toUpperCase()}-${Math.floor(Math.random()*1000)}`
        await prisma.certificate.create({
            data: {
                id: genId('crt'), // standard is not defined for cert in docs, assuming crt or similar
                userId: admin.id,
                courseId: course.id,
                type: 'COURSE',
                serialNumber: serial,
                metadata: { score: 100, instructor: "System" }
            }
        })
        console.log(`✅ Issued certificate for: ${course.title}`)
    } catch (e) {
        // Ignore unique constraint
    }
  }

  // 4. FIX DAILY QUESTS
  // Check why they might be missing. 
  // It could be that 'checkDailyLogin' logic relies on timezone alignment.
  // We will force create quests for TODAY for admin.
  
  const today = new Date()
  today.setHours(0,0,0,0)
  
  const existingQuests = await prisma.dailyQuest.count({
    where: { userId: admin.id, date: today }
  })

  if (existingQuests === 0) {
    console.log("🔧 Fixing Daily Quests for Admin...")
    const templates = [
        { type: 'LOGIN', desc: 'Login hari ini', target: 1, xp: 20 },
        { type: 'READ_MATERIAL', desc: 'Baca 1 materi pelajaran', target: 1, xp: 50 },
        { type: 'COMPLETE_QUIZ', desc: 'Selesaikan 1 kuis', target: 1, xp: 100 }
    ]
    
    for (const t of templates) {
        await prisma.dailyQuest.create({
            data: {
                userId: admin.id,
                date: today,
                type: t.type,
                description: t.desc,
                target: t.target,
                progress: t.type === 'LOGIN' ? 1 : 0,
                isClaimed: false,
                xpReward: t.xp
            }
        })
    }
    console.log("✅ Daily Quests regenerated.")
  } else {
    console.log(`ℹ️ Admin already has ${existingQuests} quests for today.`)
  }

}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
