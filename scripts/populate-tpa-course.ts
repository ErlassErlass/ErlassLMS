
import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Mulai menambahkan kursus TPA...')

  // 1. Get Admin User for creator
  const admin = await prisma.user.findFirst({
    where: { role: 'SUPERADMIN' }
  })

  if (!admin) {
    console.error('❌ Admin user not found. Please run seed first.')
    return
  }

  // 2. Get or Create Category "Akademik"
  let category = await prisma.courseCategory.findUnique({
    where: { slug: 'akademik' }
  })

  if (!category) {
    category = await prisma.courseCategory.create({
      data: {
        name: 'Akademik',
        slug: 'akademik',
        description: 'Persiapan tes masuk perguruan tinggi dan psikotes.'
      }
    })
    console.log('✅ Kategori "Akademik" dibuat.')
  }

  // 3. Create Course
  const course = await prisma.course.create({
    data: {
      title: 'Tes Potensi Akademik (TPA) Lengkap',
      description: 'Panduan lengkap menguasai TPA (Verbal, Numerikal, Logika) serta pemahaman tentang kecerdasan holistik (EQ & Karakter). Cocok untuk persiapan seleksi akademik.',
      category: 'akademik', // String fallback
      categoryId: category.id,
      level: 'Advanced',
      price: 150000,
      isPremium: true,
      isPublished: true,
      createdById: admin.id,
      freeSections: 1, // Section 1 gratis sebagai preview
      coverImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80' // Brain/Study image
    }
  })

  console.log(`✅ Kursus "${course.title}" berhasil dibuat.`)

  // 4. Create Sections
  const sectionsData = [
    {
      title: "Pengantar Tes Potensi Akademik",
      description: "Definisi, Tujuan, dan Komponen Inti TPA",
      orderIndex: 0,
      isFree: true, // Gratis
      content: `
        <h2>🎯 Pengantar Tes Potensi Akademik (TPA)</h2>
        <p>TPA mengukur kemampuan dasar kognitif yang esensial untuk keberhasilan akademik. Tes ini tidak hanya menguji hafalan, tetapi logika berpikir.</p>
        
        <h3>Komponen Utama:</h3>
        <ul>
            <li><strong>Verbal:</strong> Kemampuan bahasa dan kata.</li>
            <li><strong>Numerikal:</strong> Kemampuan angka dan hitungan.</li>
            <li><strong>Logika:</strong> Kemampuan penalaran deduktif/induktif.</li>
            <li><strong>Analitis:</strong> Kemampuan analisis masalah.</li>
            <li><strong>Spasial:</strong> Kemampuan visual gambar.</li>
        </ul>
      `
    },
    {
      title: "Kemampuan Verbal",
      description: "Sinonim, Antonim, Analogi, dan Pemahaman Bacaan",
      orderIndex: 1,
      content: `
        <h2>1. Kemampuan Verbal</h2>
        <p>Mengukur pemahaman dan penggunaan bahasa yang efektif.</p>

        <h3>🔍 Sub-komponen:</h3>
        <ul>
            <li><strong>Sinonim & Antonim:</strong> Vocabulary breadth. Contoh: <em>PROLIFERASI ≈ Penyebaran</em>.</li>
            <li><strong>Analogi Verbal:</strong> Hubungan logika antar kata. Contoh: <em>KAKI : BERJALAN = TANGAN : MENULIS</em>.</li>
            <li><strong>Penalaran Verbal:</strong> Menarik kesimpulan dari teks bacaan.</li>
        </ul>

        <div class="bg-gray-100 p-4 rounded-lg my-4 border-l-4 border-blue-500">
            <strong>💡 Tips:</strong> Perbanyak membaca artikel ilmiah dan editorial untuk memperkaya kosakata.
        </div>
      `
    },
    {
      title: "Kemampuan Numerikal",
      description: "Aritmatika, Deret Angka, dan Soal Cerita",
      orderIndex: 2,
      content: `
        <h2>2. Kemampuan Numerikal</h2>
        <p>Mengukur kemampuan matematika dasar dan kuantitatif.</p>

        <h3>📐 Pola Deret Angka:</h3>
        <pre class="bg-black text-green-400 p-3 rounded">
Aritmatika: 2, 5, 8, 11 (+3)
Geometrik: 3, 6, 12, 24 (x2)
Fibonacci: 1, 1, 2, 3, 5 (Jumlah 2 angka sebelumnya)
        </pre>

        <h3>🧮 Soal Cerita:</h3>
        <p>Biasanya meliputi Rasio, Persentase, Kecepatan/Waktu, dan Matematika Terapan sehari-hari.</p>
      `
    },
    {
      title: "Kemampuan Logika & Analitis",
      description: "Silogisme, Puzzle Logika, dan Analisis Data",
      orderIndex: 3,
      content: `
        <h2>3. Kemampuan Logika</h2>
        <p>Mengukur penalaran deduktif dan induktif.</p>
        
        <h3>Contoh Silogisme:</h3>
        <ul>
            <li><strong>Premis 1:</strong> Semua programmer bisa coding.</li>
            <li><strong>Premis 2:</strong> Andi adalah programmer.</li>
            <li><strong>Kesimpulan:</strong> Andi bisa coding. (Valid)</li>
        </ul>

        <h2>4. Kemampuan Analitis</h2>
        <p>Menganalisis data tabel/grafik dan mengevaluasi argumen.</p>
      `
    },
    {
      title: "Kemampuan Spasial & Abstrak",
      description: "Rotasi Mental, Deret Gambar, dan Pola Simbol",
      orderIndex: 4,
      content: `
        <h2>5. Kemampuan Spasial</h2>
        <p>Visual-spatial intelligence. Menguji kemampuan membayangkan objek 3D dari gambar 2D, rotasi mental, dan penyusunan diagram.</p>

        <h2>6. Kemampuan Abstrak</h2>
        <p>Pattern recognition tanpa kata atau angka. Contoh: Matrix Reasoning (Raven's Matrices) dan deret simbol abstrak.</p>
      `
    },
    {
      title: "Kecerdasan Emosional & Karakter (Di Luar TPA)",
      description: "Apa yang tidak diukur TPA namun penting untuk kesuksesan",
      orderIndex: 5,
      content: `
        <h2>❌ Batasan TPA</h2>
        <p>TPA adalah prediktor akademik yang baik, namun <strong>TIDAK</strong> mengukur:</p>
        <ul>
            <li><strong>EQ (Emotional Intelligence):</strong> Empati, regulasi emosi, kesadaran sosial.</li>
            <li><strong>Karakter:</strong> Integritas, kejujuran, tanggung jawab.</li>
            <li><strong>Grit:</strong> Ketekunan dan daya tahan mental.</li>
        </ul>

        <div class="bg-yellow-100 p-4 rounded-lg my-4 text-yellow-800">
            <strong>Riset menunjukkan:</strong> EQ dan Keterampilan Sosial memprediksi 50-60% kesuksesan karir jangka panjang, sedangkan IQ/TPA hanya sekitar 25-30%.
        </div>
      `
    },
    {
      title: "Strategi & Implementasi",
      description: "Tips persiapan tes dan aplikasi di sekolah",
      orderIndex: 6,
      content: `
        <h2>🚀 Action Plan</h2>
        <ol>
            <li><strong>Diagnostic:</strong> Gunakan TPA untuk mengetahui kekuatan/kelemahan.</li>
            <li><strong>Practice:</strong> Latihan soal pola secara rutin.</li>
            <li><strong>Holistic Approach:</strong> Jangan hanya fokus kognitif. Kembangkan juga <em>soft skills</em> dan karakter.</li>
        </ol>

        <h3>Skoring & Interpretasi</h3>
        <p>Skor TPA biasanya menggunakan norma (percentile). Skor tinggi (>75th percentile) menunjukkan potensi akademik yang solid.</p>
      `
    }
  ]

  for (const section of sectionsData) {
    await prisma.courseSection.create({
      data: {
        courseId: course.id,
        title: section.title,
        description: section.description,
        content: section.content,
        orderIndex: section.orderIndex,
        isFree: section.isFree || false,
        estimatedDuration: 15
      }
    })
  }

  console.log(`✅ ${sectionsData.length} Materi berhasil ditambahkan.`)
  
  // Update total sections
  await prisma.course.update({
    where: { id: course.id },
    data: { totalSections: sectionsData.length }
  })

  console.log('🎉 Selesai! Kursus siap dijual.')
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
