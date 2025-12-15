
import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

const jsCourseData = {
  title: "Jago JavaScript: Dari Nol sampai Bikin Game",
  description: "Panduan lengkap belajar pemrograman web (HTML, CSS, JavaScript) dari instalasi tools hingga membuat game interaktif seperti Flappy Bird dan Doodle Jump.",
  category: "javascript",
  level: "Beginner",
  price: 250000, // Estimasi harga, bisa diubah
  isPremium: true,
  freeSections: 3, // Pertemuan 0, 1, 2 gratis
  totalSections: 25,
  coverImage: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80", // Placeholder image
  isPublished: true,
}

const jsSections = [
  {
    orderIndex: 0,
    title: "Setting Environment",
    description: "Instalasi dan persiapan tools untuk coding.",
    content: `
### Sub-Topik
- Pengenalan Google Chrome dan browser alternatif
- Penggunaan VS Code sebagai editor
- Pengaturan ekstensi untuk coding

### Tujuan Pembelajaran
Siswa dapat menginstal dan mengatur lingkungan kerja yang diperlukan untuk pemrograman HTML, CSS, dan JavaScript secara offline.

### Materi
- Instalasi Google Chrome /browser
- Install VS Code/ editor lain
- VS Code Overview
- Install ekstensi Live-Preview, Prettier, dan Emmet
- Pengaturan VS Code untuk bekerja offline.

### Proyek/Latihan
Instalasi semua tools yang dibutuhkan untuk coding HTML, CSS, dan JavaScript secara offline.
    `,
    isFree: true
  },
  {
    orderIndex: 1,
    title: "Pengenalan HTML5",
    description: "Memahami struktur dasar halaman web.",
    content: `
### Sub-Topik
- Elemen dan tag HTML dasar
- Struktur halaman HTML
- Menggunakan elemen teks, daftar, link, dan gambar

### Tujuan Pembelajaran
Siswa memahami dasar-dasar HTML dan mampu membuat struktur halaman web sederhana.

### Materi
Dasar-dasar HTML, elemen, tag, struktur halaman, paragraf, heading, daftar, link, gambar.

### Proyek/Latihan
Membuat halaman sederhana dengan heading dan paragraf.
    `,
    isFree: true
  },
  {
    orderIndex: 2,
    title: "Pengenalan CSS3",
    description: "Mempercantik halaman web dengan gaya dasar.",
    content: `
### Sub-Topik
- Mengatur warna dan gaya teks
- Selektor CSS dasar
- Margin, padding, dan font styling

### Tujuan Pembelajaran
Siswa dapat menerapkan style dasar pada halaman web menggunakan CSS.

### Materi
Penggunaan CSS untuk gaya halaman, selektor, warna, margin, padding, font.

### Proyek/Latihan
Mengatur style dasar untuk halaman.
    `,
    isFree: true
  },
  {
    orderIndex: 3,
    title: "Pengenalan JavaScript",
    description: "Dasar-dasar logika pemrograman.",
    content: `
### Sub-Topik
- Variabel dan tipe data
- Operator dasar
- Penggunaan alert dan console.log

### Tujuan Pembelajaran
Siswa memahami dasar-dasar JavaScript, termasuk variabel dan output sederhana.

### Materi
Dasar-dasar JavaScript, variabel, tipe data, operator, alert, console.log.

### Proyek/Latihan
Membuat alert sederhana di halaman web.
    `,
    isFree: false
  },
  {
    orderIndex: 4,
    title: "Fungsi dan Event di JavaScript",
    description: "Membuat halaman web interaktif.",
    content: `
### Sub-Topik
- Membuat dan memanggil fungsi
- Menggunakan event listener untuk interaksi
- Mengontrol DOM dengan event

### Tujuan Pembelajaran
Siswa dapat membuat fungsi dan mengelola interaksi pengguna melalui event.

### Materi
Fungsi, event listener, klik tombol, interaksi dengan DOM.

### Proyek/Latihan
Proyek: How to create a Color Flipper
    `,
    isFree: false
  },
  {
    orderIndex: 5,
    title: "Kondisi dan Perulangan di JavaScript",
    description: "Logika keputusan dan pengulangan.",
    content: `
### Sub-Topik
- If/else statements
- Perulangan for dan while
- Membuat logika keputusan sederhana

### Tujuan Pembelajaran
Siswa memahami konsep kondisi dan perulangan dalam JavaScript untuk membuat logika sederhana.

### Materi
Kondisi if/else, perulangan for/while.

### Proyek/Latihan
Proyek: How to create a counter
    `,
    isFree: false
  },
  {
    orderIndex: 6,
    title: "Array dan Objek di JavaScript",
    description: "Mengelola data yang lebih kompleks.",
    content: `
### Sub-Topik
- Array dan cara mengakses elemen
- Pengenalan objek
- Memanipulasi data dalam array dan objek

### Tujuan Pembelajaran
Siswa mampu bekerja dengan array dan objek dalam JavaScript untuk menyimpan dan mengakses data kompleks.

### Materi
Pengenalan array dan objek, cara mengakses dan memanipulasi data.

### Proyek/Latihan
Proyek: How to create a review carousel
    `,
    isFree: false
  },
  {
    orderIndex: 7,
    title: "Layout dan Flexbox di CSS3",
    description: "Mengatur tata letak yang rapi dan responsif.",
    content: `
### Sub-Topik
- Flexbox dasar untuk layout
- Kontrol tampilan responsif
- Menyusun elemen dalam baris atau kolom

### Tujuan Pembelajaran
Siswa memahami cara menggunakan Flexbox untuk mengatur tata letak halaman yang responsif.

### Materi
Mengatur layout halaman dengan Flexbox, responsive design dasar.

### Proyek/Latihan
Proyek: How to create a responsive navbar
    `,
    isFree: false
  },
  {
    orderIndex: 8,
    title: "Positioning dan Grid di CSS3",
    description: "Teknik layout tingkat lanjut.",
    content: `
### Sub-Topik
- Positioning relatif dan absolut
- Layout dengan grid
- Struktur halaman yang kompleks

### Tujuan Pembelajaran
Siswa dapat menggunakan teknik positioning dan grid layout untuk mengatur elemen di halaman web.

### Materi
Positioning: relative, absolute, fixed, grid layout.

### Proyek/Latihan
Proyek: How to create a sidebar
    `,
    isFree: false
  },
  {
    orderIndex: 9,
    title: "Manipulasi DOM",
    description: "Mengubah elemen HTML secara dinamis.",
    content: `
### Sub-Topik
- Mengubah elemen DOM dengan JavaScript
- Manipulasi innerHTML dan appendChild
- Membuat antarmuka dinamis

### Tujuan Pembelajaran
Siswa memahami cara mengubah elemen HTML secara dinamis menggunakan JavaScript.

### Materi
Cara mengubah elemen DOM dengan JavaScript, innerHTML, appendChild.

### Proyek/Latihan
Proyek: How to create a modal
    `,
    isFree: false
  },
  {
    orderIndex: 10,
    title: "Animasi CSS",
    description: "Membuat web lebih hidup dengan animasi.",
    content: `
### Sub-Topik
- Transisi dan transformasi CSS
- Efek hover dan klik
- Membuat animasi sederhana

### Tujuan Pembelajaran
Siswa dapat menerapkan animasi dasar menggunakan CSS untuk membuat antarmuka yang lebih menarik.

### Materi
Dasar animasi di CSS, transitions, transforms.

### Proyek/Latihan
Proyek: How to create a FAQ page
    `,
    isFree: false
  },
  {
    orderIndex: 11,
    title: "Media Queries",
    description: "Membuat web responsif di berbagai perangkat.",
    content: `
### Sub-Topik
- Penggunaan media queries untuk responsive
- Menyesuaikan tampilan halaman berdasarkan perangkat

### Tujuan Pembelajaran
Siswa memahami konsep responsive design dan menggunakan media queries untuk penyesuaian tampilan halaman.

### Materi
Responsive design lanjutan dengan media queries.

### Proyek/Latihan
Proyek: How to create a restaurant menu page
    `,
    isFree: false
  },
  {
    orderIndex: 12,
    title: "Video dan Audio HTML5",
    description: "Menambahkan multimedia ke website.",
    content: `
### Sub-Topik
- Menyematkan video dan audio
- Atribut HTML5 khusus media
- Kontrol media di halaman

### Tujuan Pembelajaran
Siswa dapat menambahkan dan mengontrol elemen video dan audio di halaman web.

### Materi
Menambahkan video dan audio ke halaman web, atribut HTML5 khusus media.

### Proyek/Latihan
Proyek: How to create a video background
    `,
    isFree: false
  },
  {
    orderIndex: 13,
    title: "Scroll dan Efek di JavaScript",
    description: "Interaksi berbasis scroll.",
    content: `
### Sub-Topik
- Mengelola scroll halaman
- Menambahkan efek saat scroll
- Navigasi dinamis saat scroll

### Tujuan Pembelajaran
Siswa dapat mengatur scroll dan efek yang diaktifkan saat pengguna menggulir halaman.

### Materi
Mengatur scroll, menambahkan efek saat scroll.

### Proyek/Latihan
Proyek: How to create a navigation bar on scroll
    `,
    isFree: false
  },
  {
    orderIndex: 14,
    title: "Tab Navigasi Dinamis",
    description: "Membuat konten tab interaktif.",
    content: `
### Sub-Topik
- Membuat navigasi tab dinamis
- Menampilkan konten berbeda tanpa reload
- Meningkatkan pengalaman navigasi pengguna

### Tujuan Pembelajaran
Siswa dapat membuat tab yang menampilkan konten berbeda di halaman yang sama untuk pengalaman pengguna yang lebih baik.

### Materi
Membuat tab untuk menampilkan konten berbeda di halaman yang sama.

### Proyek/Latihan
Proyek: How to create tabs that display different content
    `,
    isFree: false
  },
  {
    orderIndex: 15,
    title: "Proyek Interaktif: Countdown Timer",
    description: "Latihan logika waktu.",
    content: `
### Sub-Topik
- Membuat countdown timer
- Menghitung waktu mundur dengan JavaScript
- Membuat fitur timer yang responsif dan interaktif

### Tujuan Pembelajaran
Siswa dapat membuat countdown timer dengan JavaScript yang berguna sebagai pengingat atau timer.

### Materi
Membuat jam countdown dengan JavaScript.

### Proyek/Latihan
Proyek: How to create a countdown clock
    `,
    isFree: false
  },
  {
    orderIndex: 16,
    title: "Teks dan Data Dinamis",
    description: "Manipulasi string dan data.",
    content: `
### Sub-Topik
- Membuat teks dummy otomatis
- Manipulasi string di JavaScript
- Menampilkan data dinamis untuk keperluan desain

### Tujuan Pembelajaran
Siswa memahami manipulasi string untuk membuat konten dinamis dalam desain web.

### Materi
Membuat teks dummy otomatis dengan JavaScript, manipulasi string.

### Proyek/Latihan
Proyek: How to create your own Lorem ipsum
    `,
    isFree: false
  },
  {
    orderIndex: 17,
    title: "Manajemen List (To-Do App)",
    description: "CRUD dasar dengan JavaScript.",
    content: `
### Sub-Topik
- Membuat dan menambah elemen list
- Menghapus elemen list dengan interaksi user
- Mengelola list dinamis

### Tujuan Pembelajaran
Siswa dapat membuat dan mengelola daftar dengan input pengguna.

### Materi
Membuat dan mengelola list dengan input user.

### Proyek/Latihan
Proyek: How to create a grocery list
    `,
    isFree: false
  },
  {
    orderIndex: 18,
    title: "Slider Gambar",
    description: "Komponen UI populer.",
    content: `
### Sub-Topik
- Membuat slider gambar sederhana
- Mengelola navigasi gambar dengan tombol
- Efek transisi antar gambar

### Tujuan Pembelajaran
Siswa dapat membuat slider gambar interaktif dengan JavaScript.

### Materi
Membuat slider gambar interaktif dengan JavaScript.

### Proyek/Latihan
Proyek: How to create an image slider
    `,
    isFree: false
  },
  {
    orderIndex: 19,
    title: "Game Dasar: Rock Paper Scissors",
    description: "Membuat game pertama.",
    content: `
### Sub-Topik
- Logika if/else untuk keputusan game
- Fungsi random number
- Membuat game interaktif melawan komputer

### Tujuan Pembelajaran
Siswa dapat membuat game sederhana menggunakan JavaScript dengan logika keputusan dan angka acak.

### Materi
Pembuatan game sederhana dengan logika if/else dan random number.

### Proyek/Latihan
Proyek: How to create a Rock Paper Scissors game
    `,
    isFree: false
  },
  {
    orderIndex: 20,
    title: "Game Simon",
    description: "Game asah memori.",
    content: `
### Sub-Topik
- Membuat urutan warna dinamis
- Menggunakan logika JavaScript untuk memori
- Tantangan memori pengguna

### Tujuan Pembelajaran
Siswa dapat membuat game interaktif yang menguji memori pengguna menggunakan JavaScript.

### Materi
Game interaktif Simon menggunakan logika JavaScript.

### Proyek/Latihan
Proyek: How to create a Simon Game
    `,
    isFree: false
  },
  {
    orderIndex: 21,
    title: "Game Platformer Dasar",
    description: "Gerakan dan fisika dasar.",
    content: `
### Sub-Topik
- Gerakan karakter dengan tombol arah
- Logika game platformer dasar
- Membuat lingkungan permainan

### Tujuan Pembelajaran
Siswa dapat membuat game platformer dasar dengan logika gerak karakter.

### Materi
Membuat game platformer sederhana dengan gerakan karakter.

### Proyek/Latihan
Proyek: How to create a Platformer Game
    `,
    isFree: false
  },
  {
    orderIndex: 22,
    title: "Game Lanjutan 1: Doodle Jump",
    description: "Gravitasi dan rintangan.",
    content: `
### Sub-Topik
- Gerakan vertikal dan gravitasi
- Kontrol karakter
- Logika obstacle dalam game

### Tujuan Pembelajaran
Siswa dapat membuat game dengan konsep gravitasi dan obstacle, seperti Doodle Jump.

### Materi
Membuat game Doodle Jump dengan gravitasi dan kontrol gerak.

### Proyek/Latihan
Proyek: How to create Doodle Jump
    `,
    isFree: false
  },
  {
    orderIndex: 23,
    title: "Game Lanjutan 2: Flappy Bird",
    description: "Logika tabrakan dan skor.",
    content: `
### Sub-Topik
- Logika penghalang dinamis
- Mengatur alur permainan dengan JavaScript
- Meningkatkan kompleksitas interaksi

### Tujuan Pembelajaran
Siswa dapat membuat game seperti Flappy Bird menggunakan gravitasi dan logika penghalang.

### Materi
Membuat game Flappy Bird dengan gerakan gravitasi dan penghalang.

### Proyek/Latihan
Proyek: How to create Flappy Bird
    `,
    isFree: false
  },
  {
    orderIndex: 24,
    title: "Proyek Akhir",
    description: "Tugas besar pembuatan game klasik.",
    content: `
### Sub-Topik
- Memilih game klasik untuk direplikasi
- Mengaplikasikan konsep yang telah dipelajari
- Mengatur gameplay dan antarmuka

### Tujuan Pembelajaran
Siswa mengaplikasikan seluruh konsep yang telah dipelajari untuk membuat game klasik menggunakan JavaScript.

### Materi
Membuat salah satu dari beberapa game klasik menggunakan JavaScript.

### Proyek/Latihan
Proyek: How to create a Memory game, Whack-a-mole game, Connect Four, Snake, Space Invaders, Frogger, atau Tetris
    `,
    isFree: false
  }
]

async function populateJsCourse() {
  console.log('Populating JavaScript course...')

  // 1. Find Admin User (or create one placeholder if needed, but assuming seeds ran)
  // We need an instructor ID. Let's try to find 'mentor@example.com' created in main seed
  let instructor = await prisma.user.findFirst({
    where: { email: 'mentor@example.com' }
  })

  if (!instructor) {
    console.log('Mentor not found, using first admin or creating new user...')
    instructor = await prisma.user.findFirst({
        where: { role: 'SUPERADMIN' }
    })
    
    if (!instructor) {
        // Fallback: should typically not happen if main seed ran
        throw new Error("No user found to assign as instructor. Please run 'npm run seed' first.")
    }
  }

  // 2. Create Course
  const course = await prisma.course.create({
    data: {
      title: jsCourseData.title,
      description: jsCourseData.description,
      category: jsCourseData.category,
      level: jsCourseData.level,
      price: jsCourseData.price,
      isPremium: jsCourseData.isPremium,
      freeSections: jsCourseData.freeSections,
      totalSections: jsCourseData.totalSections,
      coverImage: jsCourseData.coverImage,
      isPublished: jsCourseData.isPublished,
      createdById: instructor.id
    }
  })

  console.log(`Created course: ${course.title} (ID: ${course.id})`)

  // 3. Create Sections
  for (const section of jsSections) {
    await prisma.courseSection.create({
      data: {
        title: section.title,
        description: section.description,
        content: section.content,
        orderIndex: section.orderIndex,
        isFree: section.isFree,
        courseId: course.id,
        estimatedDuration: 45 // Default 45 menit per sesi
      }
    })
    console.log(`  - Added section: ${section.title}`)
  }

  console.log('JavaScript course population complete!')
}

populateJsCourse()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
