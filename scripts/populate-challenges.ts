
import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

const challenges = [
  {
    title: "Buat Game Maze di Scratch",
    description: "Buat game maze sederhana dimana pemain harus menemukan jalan keluar. Pemain mengendalikan sprite utama dengan tombol panah.",
    difficulty: "Easy",
    category: "scratch",
    points: 100,
    instructions: `
# Instruksi
1. Buat latar belakang (Backdrop) berbentuk labirin (maze). Pastikan garis dinding memiliki warna yang kontras.
2. Pilih sprite karakter utama (misalnya kucing Scratch).
3. Program sprite agar bisa bergerak ke atas, bawah, kiri, dan kanan menggunakan tombol panah.
4. Tambahkan logika: Jika sprite menyentuh warna dinding labirin, sprite harus kembali ke posisi awal.
5. Tambahkan sprite "Goal" (misalnya kue atau bendera). Jika karakter menyentuh Goal, tampilkan pesan "Menang!".

# Tips
- Gunakan blok "If touching color" untuk deteksi tabrakan dinding.
- Gunakan blok "Go to x: y:" untuk posisi awal.
    `,
    expectedOutput: "Project Scratch (.sb3) dengan karakter yang bisa bergerak dan deteksi tembok.",
    published: true
  },
  {
    title: "Kalkulator Sederhana dengan Python",
    description: "Buat program Python sederhana yang bisa melakukan operasi penjumlahan, pengurangan, perkalian, dan pembagian.",
    difficulty: "Medium",
    category: "python",
    points: 200,
    instructions: `
# Instruksi
1. Buat fungsi untuk masing-masing operasi: tambah, kurang, kali, bagi.
2. Minta user menginput dua angka.
3. Minta user memilih operasi (1, 2, 3, atau 4).
4. Tampilkan hasil perhitungan.

# Contoh Output
\`\`\`
Pilih operasi:
1. Tambah
2. Kurang
3. Kali
4. Bagi

Masukkan pilihan(1/2/3/4): 1
Masukkan bilangan pertama: 10
Masukkan bilangan kedua: 5
10 + 5 = 15
\`\`\`
    `,
    starterCode: `
def tambah(x, y):
    # Tulis kodemu di sini
    pass

def kurang(x, y):
    # Tulis kodemu di sini
    pass

# Lanjutkan...
    `,
    expectedOutput: "Program Python yang berjalan di console.",
    published: true
  },
  {
    title: "Lampu Lalu Lintas Microbit",
    description: "Simulasikan lampu lalu lintas menggunakan LED matrix pada Microbit.",
    difficulty: "Easy",
    category: "microbit",
    points: 150,
    instructions: `
# Instruksi
1. Tampilkan ikon kotak penuh (Merah) selama 3 detik.
2. Tampilkan ikon kotak kecil (Kuning/Siap) selama 1 detik.
3. Tampilkan ikon tanda centang atau panah (Hijau/Jalan) selama 3 detik.
4. Ulangi terus menerus.

# Bonus
- Tambahkan animasi kedip saat lampu kuning.
    `,
    expectedOutput: "File .hex Microbit yang menampilkan animasi lampu lalu lintas.",
    published: true
  }
]

async function main() {
  console.log('Populating challenges...')

  for (const challenge of challenges) {
    await prisma.challenge.create({
      data: {
        title: challenge.title,
        description: challenge.description,
        difficulty: challenge.difficulty,
        category: challenge.category,
        points: challenge.points,
        instructions: challenge.instructions,
        expectedOutput: challenge.expectedOutput,
        starterCode: challenge.starterCode,
        published: challenge.published
      }
    })
    console.log(`Created challenge: ${challenge.title}`)
  }

  console.log('Done!')
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
