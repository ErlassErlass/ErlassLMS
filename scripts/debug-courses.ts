import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log("🔍 DEBUG: LIST ALL COURSES")
  console.log("=========================")
  
  const courses = await prisma.course.findMany({
    select: {
      id: true,
      title: true,
      isPublished: true,
      isPremium: true,
      price: true
    }
  })

  if (courses.length === 0) {
    console.log("❌ Tidak ada kursus di database!")
  } else {
    courses.forEach((c, index) => {
      console.log(`${index + 1}. [${c.isPublished ? '✅ PUBLISHED' : '❌ DRAFT'}] ${c.title}`)
      console.log(`   ID: ${c.id}`)
      console.log(`   Price: ${c.price} (Premium: ${c.isPremium})`)
      console.log(`   Link Checkout: http://localhost:3000/dashboard/courses/${c.id}/checkout`)
      console.log("-------------------------")
    })
  }
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
