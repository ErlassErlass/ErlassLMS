
import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

const pythonChallenges = [
  {
    title: "Kalkulator Umur (Python Dasar)",
    description: "Buat program yang meminta tahun lahir user dan menghitung umur mereka sekarang.",
    difficulty: "Easy",
    category: "python",
    points: 100,
    instructions: `
# Instruksi
1. Gunakan \`input()\` untuk meminta tahun lahir.
2. Gunakan tahun sekarang (misal: 2025) sebagai konstanta.
3. Hitung umur = tahun sekarang - tahun lahir.
4. Tampilkan hasilnya dengan \`print()\`.

# Tips
- Jangan lupa ubah input string ke integer menggunakan \`int()\`.
    `,
    starterCode: `
tahun_sekarang = 2025
# Tulis kodemu di sini
    `,
    expectedOutput: "Output berupa teks: 'Umur kamu adalah ... tahun'",
    published: true
  },
  {
    title: "Ganjil atau Genap?",
    description: "Program untuk menentukan apakah sebuah angka adalah bilangan ganjil atau genap.",
    difficulty: "Easy",
    category: "python",
    points: 100,
    instructions: `
# Instruksi
1. Minta user memasukkan angka.
2. Gunakan operator modulus \`%\` untuk mengecek sisa bagi.
3. Jika angka % 2 == 0, maka GENAP.
4. Jika tidak, maka GANJIL.
    `,
    expectedOutput: "Output: 'Angka ... adalah bilangan Genap/Ganjil'",
    published: true
  },
  {
    title: "Daftar Belanja (List)",
    description: "Buat program sederhana untuk mengelola daftar belanja.",
    difficulty: "Medium",
    category: "python",
    points: 200,
    instructions: `
# Instruksi
1. Buat list kosong \`belanjaan = []\`.
2. Minta user memasukkan 3 nama barang menggunakan loop.
3. Tambahkan setiap barang ke dalam list.
4. Setelah selesai, tampilkan semua isi list.
    `,
    starterCode: `
belanjaan = []
# Gunakan loop for untuk meminta 3 input
    `,
    expectedOutput: "List barang belanjaan tercetak di layar.",
    published: true
  },
  {
    title: "Tebak Angka (Python Logic)",
    description: "Game tebak angka klasik.",
    difficulty: "Medium",
    category: "python",
    points: 250,
    instructions: `
# Instruksi
1. Import modul random.
2. Acak angka 1-10.
3. Minta user menebak.
4. Beri feedback: 'Terlalu rendah', 'Terlalu tinggi', atau 'Benar!'.
    `,
    published: true
  }
]

async function main() {
  console.log('Populating Python challenges...')

  for (const challenge of pythonChallenges) {
    const exists = await prisma.challenge.findFirst({
        where: { title: challenge.title }
    })

    if (!exists) {
        await prisma.challenge.create({
        data: {
            title: challenge.title,
            description: challenge.description,
            difficulty: challenge.difficulty,
            category: challenge.category,
            points: challenge.points,
            instructions: challenge.instructions,
            expectedOutput: challenge.expectedOutput || "Program berjalan tanpa error",
            starterCode: challenge.starterCode,
            published: challenge.published
        }
        })
        console.log(`Created challenge: ${challenge.title}`)
    } else {
        console.log(`Skipped existing challenge: ${challenge.title}`)
    }
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
