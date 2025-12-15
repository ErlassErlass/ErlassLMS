
import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

// --- Data Kurikulum SD ---
const pythonSDSections = [
  { title: "Apa itu Coding dan Python?", description: "Mengenal logika komputer dan perintah dasar.", content: "### Materi\n- Cerita: “Komputer bisa disuruh?”\n- Mengenal `print()` untuk menampilkan teks.\n\n### Proyek\nMenampilkan “Halo Dunia!”" },
  { title: "Perintah dan Urutan (Sequence)", description: "Memahami urutan instruksi.", content: "### Materi\n- Menjalankan beberapa `print()` berurutan.\n- Mengenal konsep “alur program”.\n\n### Proyek\nProgram menyapa dan memperkenalkan diri." },
  { title: "Variabel dan Nilai", description: "Menyimpan informasi di komputer.", content: "### Materi\n- Variabel seperti kotak penyimpan data.\n- Menggunakan `input()` dan `print()`.\n\n### Proyek\nProgram “Data Diri Saya”" },
  { title: "Kondisi: Jika dan Kalau Tidak (If/Else)", description: "Logika pengambilan keputusan.", content: "### Materi\n- Cerita interaktif dengan “if”.\n- Contoh: jika nama = “Budi”, tampilkan “Halo Budi!”.\n\n### Proyek\nProgram tebak nama / tebakan sederhana." },
  { title: "Perulangan (Loop)", description: "Mengulang perintah untuk efisiensi.", content: "### Materi\n- `for` dan `while` sederhana.\n- Contoh: mencetak angka 1–10.\n\n### Proyek\nProgram hitung mundur roket 🚀" },
  { title: "Membuat Pola dengan Loop", description: "Logika perulangan bertingkat.", content: "### Materi\n- Pola bintang sederhana (nested loop kecil).\n\n### Proyek\nPola segitiga dari bintang." },
  { title: "Bermain dengan Teks dan Angka", description: "Operasi matematika dasar.", content: "### Materi\n- Operasi matematika sederhana (+, -, ×, ÷).\n- Mencetak hasil dengan teks.\n\n### Proyek\nKalkulator mini sederhana." },
  { title: "Proyek Game: Tebak Angka", description: "Gabungan input, kondisi, dan loop.", content: "### Materi\n- Menggunakan `random` dan `if/else`.\n\n### Proyek\nGame “Tebak Angka” interaktif." },
  { title: "Grafik Sederhana dengan Turtle", description: "Visualisasi kode.", content: "### Materi\n- Memakai `turtle` untuk menggambar bentuk (garis, segitiga, persegi).\n\n### Proyek\nGambar rumah atau bendera." },
  { title: "Pameran Karya Coding", description: "Proyek akhir.", content: "### Materi\n- Menyusun proyek bebas: game, cerita, atau animasi sederhana.\n- Presentasi hasil karya.\n\n### Proyek\nProyek Akhir: “Karya Pythonku”" },
]

// --- Data Kurikulum SMP ---
const pythonSMPSections = [
  { title: "Pengenalan Python", description: "Mengenal Python dan IDE.", content: "Materi: Menjalankan kode di Thonny/VS Code. Proyek: Print 'Hello World!'." },
  { title: "Tipe Data dan Variabel", description: "Memahami int, str, float.", content: "Materi: Konversi tipe dan operasi sederhana. Proyek: Data diri dengan tipe data berbeda." },
  { title: "Operator dan Ekspresi", description: "Operator aritmatika dan logika.", content: "Materi: Operasi and, or, not. Proyek: Program 'Lulus atau Tidak'." },
  { title: "Kondisi If-Elif-Else", description: "Keputusan bertingkat.", content: "Materi: Logika bersyarat lebih kompleks. Proyek: Program nilai raport." },
  { title: "Looping", description: "Mengulang aksi.", content: "Materi: for, while, dan range(). Proyek: Program bilangan genap." },
  { title: "Nested Loop & Pola", description: "Pola kompleks.", content: "Materi: Loop bersarang. Proyek: Pola kotak dan segitiga." },
  { title: "Fungsi (def)", description: "Modularisasi kode.", content: "Materi: Menulis dan memanggil fungsi. Proyek: Fungsi menghitung luas segitiga." },
  { title: "List dan Tuple", description: "Menyimpan banyak data.", content: "Materi: Iterasi list dan menambah elemen. Proyek: Daftar nilai siswa." },
  { title: "Dictionary", description: "Data berpasangan.", content: "Materi: Membuat dan mengambil data dict. Proyek: Buku telepon mini." },
  { title: "Modul Random & Time", description: "Game dinamis.", content: "Materi: random dan time.sleep(). Proyek: Game tebak angka waktu terbatas." },
  { title: "Grafik Turtle", description: "Gambar dinamis.", content: "Materi: Gambar dan animasi sederhana. Proyek: Gambar bola memantul." },
  { title: "Proyek Akhir: Bola Memantul", description: "Integrasi konsep.", content: "Materi: Siswa membuat game grafik sederhana. Proyek: Game Bola Memantul." },
]

// --- Data Kurikulum SMA ---
const pythonSMASections = [
  { title: "Pengenalan & Instalasi", description: "Persiapan environment.", content: "Materi: Instalasi Python & IDE. Proyek: Print teks pertama." },
  { title: "Sintaks & Komentar", description: "Struktur kode yang baik.", content: "Materi: Komentar, penulisan rapi. Proyek: Program biodata siswa." },
  { title: "Variabel & Tipe Data", description: "Pengelolaan tipe data.", content: "Materi: Konversi, input/output. Proyek: Konversi suhu." },
  { title: "Operator", description: "Aritmatika & Logika.", content: "Materi: and, or, not. Proyek: Tes kelulusan bersyarat." },
  { title: "Percabangan", description: "Logika bertingkat.", content: "Materi: if, elif, else. Proyek: Sistem nilai otomatis." },
  { title: "Perulangan", description: "Efisiensi kode.", content: "Materi: for, while, break. Proyek: Hitung rata-rata nilai." },
  { title: "Fungsi", description: "Modularisasi.", content: "Materi: Definisi dan pemanggilan fungsi. Proyek: Kalkulator fungsi." },
  { title: "Struktur Data (List, Tuple)", description: "Koleksi data.", content: "Materi: Operasi list (tambah, hapus). Proyek: Program daftar belanja." },
  { title: "Dictionary & Set", description: "Data kompleks.", content: "Materi: dict dan set. Proyek: Buku kontak." },
  { title: "File Handling", description: "Membaca & menulis file.", content: "Materi: open(), write(), read(). Proyek: Catatan nilai ke file." },
  { title: "Modul & Library", description: "Pustaka standar.", content: "Materi: math, random, datetime. Proyek: Game sederhana waktu nyata." },
  { title: "Grafik Data (Matplotlib)", description: "Visualisasi data.", content: "Materi: Pustaka matplotlib. Proyek: Grafik nilai siswa." },
  { title: "Error Handling", description: "Menangani bug.", content: "Materi: try, except, debugging. Proyek: Program input aman." },
  { title: "OOP Dasar", description: "Object Oriented Programming.", content: "Materi: class, object, method. Proyek: Simulasi akun pengguna." },
  { title: "Proyek Simulasi", description: "Aplikasi nyata.", content: "Materi: Simulasi sains/ekonomi. Proyek: Simulasi pertumbuhan populasi." },
  { title: "Proyek Akhir & Presentasi", description: "Capstone project.", content: "Materi: Dokumentasi & refleksi. Proyek: Kalkulator Interaktif / Simulasi Sains." },
]

async function main() {
  console.log('Populating Python courses...')

  // 1. Find Admin/Instructor
  let instructor = await prisma.user.findFirst({
    where: { email: 'mentor@example.com' }
  })

  if (!instructor) {
    instructor = await prisma.user.findFirst({ where: { role: 'SUPERADMIN' } })
    if (!instructor) throw new Error("No instructor found.")
  }

  // 2. Create Course: Python SD
  const courseSD = await prisma.course.create({
    data: {
      title: "Python Cilik: Petualangan Logika (SD)",
      description: "Belajar logika coding dasar dengan Python yang menyenangkan. Cocok untuk pemula (Kelas 4-6 SD).",
      category: "python",
      level: "Beginner",
      price: 150000,
      isPremium: true,
      freeSections: 3,
      totalSections: pythonSDSections.length,
      coverImage: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=800&q=80",
      isPublished: true,
      createdById: instructor.id
    }
  })
  
  for (const [index, section] of pythonSDSections.entries()) {
    await prisma.courseSection.create({
      data: {
        title: section.title,
        description: section.description,
        content: section.content,
        orderIndex: index,
        isFree: index < 3,
        courseId: courseSD.id,
        estimatedDuration: 90
      }
    })
  }
  console.log("Created Python SD Course")

  // 3. Create Course: Python SMP
  const courseSMP = await prisma.course.create({
    data: {
      title: "Python Remaja: Algoritma & Grafik (SMP)",
      description: "Mendalami struktur data dan membuat grafik interaktif dengan Turtle. (Kelas 7-9 SMP)",
      category: "python",
      level: "Intermediate",
      price: 200000,
      isPremium: true,
      freeSections: 3,
      totalSections: pythonSMPSections.length,
      coverImage: "https://images.unsplash.com/photo-1607799275518-d58665d099db?auto=format&fit=crop&w=800&q=80",
      isPublished: true,
      createdById: instructor.id
    }
  })

  for (const [index, section] of pythonSMPSections.entries()) {
    await prisma.courseSection.create({
      data: {
        title: section.title,
        description: section.description,
        content: section.content,
        orderIndex: index,
        isFree: index < 3,
        courseId: courseSMP.id,
        estimatedDuration: 90
      }
    })
  }
  console.log("Created Python SMP Course")

  // 4. Create Course: Python SMA
  const courseSMA = await prisma.course.create({
    data: {
      title: "Master Python: Data & Aplikasi (SMA)",
      description: "Penerapan Python untuk data science, OOP, dan aplikasi nyata. (Kelas 10-12 SMA)",
      category: "python",
      level: "Advanced",
      price: 250000,
      isPremium: true,
      freeSections: 3,
      totalSections: pythonSMASections.length,
      coverImage: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=800&q=80",
      isPublished: true,
      createdById: instructor.id
    }
  })

  for (const [index, section] of pythonSMASections.entries()) {
    await prisma.courseSection.create({
      data: {
        title: section.title,
        description: section.description,
        content: section.content,
        orderIndex: index,
        isFree: index < 3,
        courseId: courseSMA.id,
        estimatedDuration: 90
      }
    })
  }
  console.log("Created Python SMA Course")

  console.log('Python courses population complete!')
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
