
import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

const jsChallenges = [
  {
    title: "Kartu Nama Digital (HTML & CSS)",
    description: "Buat tampilan kartu nama digital sederhana yang berisi foto profil, nama, dan deskripsi singkat menggunakan HTML dan CSS.",
    difficulty: "Easy",
    category: "javascript", // Using 'javascript' category broad label for web dev
    points: 50,
    instructions: `
# Instruksi
1. Buat struktur HTML dengan \`div\` sebagai container kartu.
2. Tambahkan tag \`img\` untuk foto profil dan \`h1\` untuk nama.
3. Tambahkan paragraf \`p\` untuk deskripsi diri (misal: "Web Developer Cilik").
4. Gunakan CSS untuk memberi style:
   - Beri border dan border-radius pada kartu.
   - Atur text-align menjadi center.
   - Beri box-shadow agar terlihat timbul.

# Kriteria Penilaian
- Struktur HTML rapi.
- Tampilan menarik dengan CSS dasar.
    `,
    expectedOutput: "Tampilan kartu nama di tengah layar dengan styling yang rapi.",
    published: true
  },
  {
    title: "Tebak Angka (JavaScript Logic)",
    description: "Buat game logika sederhana dimana komputer memilih angka acak 1-10, dan user harus menebaknya.",
    difficulty: "Medium",
    category: "javascript",
    points: 150,
    instructions: `
# Instruksi
1. Gunakan \`Math.random()\` untuk menghasilkan angka rahasia antara 1 sampai 10.
2. Buat input field untuk user memasukkan angka.
3. Buat tombol "Tebak".
4. Saat tombol ditekan, jalankan fungsi pengecekan:
   - Jika tebakan benar, tampilkan alert "Selamat! Kamu benar!".
   - Jika salah, tampilkan "Coba lagi!".

# Tips
- Gunakan \`parseInt()\` untuk mengubah input string menjadi angka.
    `,
    starterCode: `
// Angka Rahasia
const secret = Math.floor(Math.random() * 10) + 1;

function checkGuess(userGuess) {
  // Tulis logikamu di sini
  // Bandingkan userGuess dengan secret
}
    `,
    expectedOutput: "Program yang merespon 'Benar' atau 'Salah' berdasarkan input.",
    published: true
  },
  {
    title: "Aplikasi Pengubah Warna Latar",
    description: "Latihan manipulasi DOM dasar. Buat tombol yang saat diklik akan mengubah warna latar belakang halaman secara acak.",
    difficulty: "Easy",
    category: "javascript",
    points: 100,
    instructions: `
# Instruksi
1. Buat array berisi daftar warna (contoh: \`['red', 'green', 'blue', '#f15025']\`).
2. Pilih elemen \`body\` menggunakan \`document.body\`.
3. Pasang event listener \`click\` pada sebuah tombol.
4. Di dalam fungsi event, pilih satu warna acak dari array.
5. Ubah \`document.body.style.backgroundColor\` dengan warna tersebut.
    `,
    starterCode: `
const colors = ["green", "red", "rgba(133,122,200)", "#f15025"];
const btn = document.getElementById("btn");

btn.addEventListener("click", function () {
  // 1. Ambil angka acak antara 0 - 3
  // 2. Ubah warna body
});
    `,
    expectedOutput: "Background halaman berubah warna setiap tombol diklik.",
    published: true
  },
  {
    title: "Kalkulator Sederhana (JS Function)",
    description: "Buat fungsi-fungsi JavaScript untuk melakukan operasi matematika dasar (Tambah, Kurang, Kali, Bagi) dan tampilkan hasilnya di console atau alert.",
    difficulty: "Medium",
    category: "javascript",
    points: 150,
    instructions: `
# Instruksi
1. Buat 4 fungsi: \`tambah(a,b)\`, \`kurang(a,b)\`, \`kali(a,b)\`, \`bagi(a,b)\`.
2. Minta input dari user menggunakan \`prompt()\` (atau form HTML).
3. Panggil fungsi yang sesuai dan tampilkan hasilnya.

# Tantangan Tambahan
- Validasi input agar user tidak bisa membagi dengan 0.
    `,
    expectedOutput: "Fungsi kalkulasi berjalan dengan benar.",
    published: true
  },
  {
    title: "To-Do List Interaktif (DOM Manipulation)",
    description: "Buat aplikasi pencatat tugas sederhana. User bisa menambah tugas baru ke dalam daftar.",
    difficulty: "Hard",
    category: "javascript",
    points: 300,
    instructions: `
# Instruksi
1. Siapkan input text dan tombol "Tambah".
2. Siapkan elemen \`ul\` kosong untuk menampung list.
3. Saat tombol ditekan:
   - Ambil nilai dari input.
   - Buat elemen \`li\` baru menggunakan \`document.createElement\`.
   - Isi teks \`li\` dengan nilai input.
   - Masukkan \`li\` ke dalam \`ul\` menggunakan \`appendChild\`.
4. Kosongkan input setelah menambah.

# Bonus
- Tambahkan tombol "Hapus" di setiap item list.
    `,
    expectedOutput: "Daftar tugas bertambah secara dinamis tanpa reload halaman.",
    published: true
  }
]

async function main() {
  console.log('Populating JavaScript challenges...')

  for (const challenge of jsChallenges) {
    // Check if exists to avoid duplicates based on title
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
            expectedOutput: challenge.expectedOutput,
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
