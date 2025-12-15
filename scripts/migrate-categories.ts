
import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Mulai migrasi kategori...')

  // 1. Ambil semua kursus yang ada
  const courses = await prisma.course.findMany()
  
  console.log(`📦 Ditemukan ${courses.length} kursus.`)

  // 2. Identifikasi kategori unik dari kolom string lama
  const uniqueCategories = new Set(courses.map(c => c.category).filter(Boolean))

  console.log(`🏷️  Kategori unik ditemukan: ${Array.from(uniqueCategories).join(', ')}`)

  // 3. Buat kategori di database baru dan update kursus
  for (const catName of uniqueCategories) {
    // Buat slug
    const slug = catName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
    
    // Upsert kategori (Buat jika belum ada)
    const category = await prisma.courseCategory.upsert({
      where: { slug },
      update: {},
      create: {
        name: catName.charAt(0).toUpperCase() + catName.slice(1), // Capitalize
        slug,
        description: `Kategori untuk ${catName}`
      }
    })

    console.log(`✅ Kategori '${category.name}' siap.`)

    // Update semua kursus yang punya string kategori ini
    const updateResult = await prisma.course.updateMany({
      where: { category: catName },
      data: { categoryId: category.id }
    })

    console.log(`   🔗 Terhubung ke ${updateResult.count} kursus.`)
  }

  console.log('🎉 Migrasi selesai!')
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
