
import { PrismaClient } from '@prisma/client'
import { generateId } from '../src/lib/id-generator'

const prisma = new PrismaClient()

// Helper to get Admin ID
async function getAdminId() {
    const user = await prisma.user.findFirst({ where: { role: 'SUPERADMIN' } })
    return user ? user.id : null
}

const QUESTION_BANKS = [
    {
        title: "Python Dasar - Variabel & Tipe Data",
        category: "Python",
        difficulty: "Beginner",
        description: "Kumpulan soal untuk menguji pemahaman dasar syntax Python.",
        questions: [
            {
                text: "Apa output dari `print(2 + 3 * 4)`?",
                type: "MULTIPLE_CHOICE",
                options: ["20", "14", "10", "24"],
                correct: "14",
                explanation: "Perkalian dilakukan lebih dulu daripada penjumlahan."
            },
            {
                text: "Manakah cara penulisan variabel yang SALAH di Python?",
                type: "MULTIPLE_CHOICE",
                options: ["nama_saya", "namaSaya", "2nama", "_nama"],
                correct: "2nama",
                explanation: "Nama variabel tidak boleh diawali dengan angka."
            },
            {
                text: "Tipe data dari `3.14` adalah Integer.",
                type: "TRUE_FALSE",
                options: ["True", "False"],
                correct: "False",
                explanation: "3.14 adalah tipe data Float."
            },
            {
                text: "Fungsi untuk menerima input dari pengguna adalah...",
                type: "MULTIPLE_CHOICE",
                options: ["get()", "input()", "read()", "scan()"],
                correct: "input()",
                explanation: "`input()` digunakan untuk mengambil string dari user."
            },
            {
                text: "Simbol `#` digunakan untuk membuat komentar di Python.",
                type: "TRUE_FALSE",
                options: ["True", "False"],
                correct: "True",
                explanation: "Benar, Python menggunakan pagar untuk komentar satu baris."
            }
        ]
    },
    {
        title: "HTML & CSS Dasar",
        category: "Web Development",
        difficulty: "Beginner",
        description: "Soal-soal fundamental struktur web.",
        questions: [
            {
                text: "Tag HTML untuk membuat teks tebal adalah...",
                type: "MULTIPLE_CHOICE",
                options: ["<i>", "<bold>", "<b>", "<list>"],
                correct: "<b>",
                explanation: "Tag `<b>` atau `<strong>` digunakan untuk bold text."
            },
            {
                text: "CSS singkatan dari...",
                type: "MULTIPLE_CHOICE",
                options: ["Creative Style Sheets", "Cascading Style Sheets", "Computer Style Sheets", "Colorful Style Sheets"],
                correct: "Cascading Style Sheets",
                explanation: "Cascading Style Sheets adalah kepanjangan resminya."
            },
            {
                text: "Tag `<h1>` adalah heading terbesar.",
                type: "TRUE_FALSE",
                options: ["True", "False"],
                correct: "True",
                explanation: "h1 adalah heading level 1 (terbesar)."
            },
            {
                text: "Properti CSS untuk mengubah warna teks adalah...",
                type: "MULTIPLE_CHOICE",
                options: ["font-color", "text-color", "color", "background-color"],
                correct: "color",
                explanation: "`color` mengatur warna foreground (teks)."
            },
            {
                text: "Tag `<a>` digunakan untuk menyisipkan gambar.",
                type: "TRUE_FALSE",
                options: ["True", "False"],
                correct: "False",
                explanation: "Tag `<a>` untuk link (anchor), gambar menggunakan `<img>`."
            }
        ]
    },
    {
        title: "Logika Algoritma",
        category: "Computer Science",
        difficulty: "Intermediate",
        description: "Tes logika pemrograman umum.",
        questions: [
            {
                text: "Jika `A = True` dan `B = False`, maka `A AND B` adalah...",
                type: "MULTIPLE_CHOICE",
                options: ["True", "False", "Error", "Null"],
                correct: "False",
                explanation: "Gerbang AND hanya bernilai True jika kedua operand True."
            },
            {
                text: "Struktur data LIFO (Last In First Out) disebut...",
                type: "MULTIPLE_CHOICE",
                options: ["Queue", "Array", "Stack", "Tree"],
                correct: "Stack",
                explanation: "Tumpukan (Stack) menggunakan prinsip LIFO."
            }
        ]
    }
]

async function main() {
    console.log("🚀 Seeding Question Banks...")
    
    const adminId = await getAdminId()
    if (!adminId) {
        console.error("❌ Admin user not found. Please create a user with SUPERADMIN role first.")
        return
    }

    for (const bank of QUESTION_BANKS) {
        // Create Bank
        const bankId = generateId('questionBank')
        await prisma.questionBank.create({
            data: {
                id: bankId,
                title: bank.title,
                category: bank.category,
                difficulty: bank.difficulty,
                description: bank.description,
                createdById: adminId,
                isActive: true
            }
        })
        console.log(`📚 Created Bank: ${bank.title}`)

        // Create Questions
        for (const q of bank.questions) {
            const qId = generateId('question')
            
            // Create Question Record
            await prisma.question.create({
                data: {
                    id: qId,
                    questionBankId: bankId,
                    questionText: q.text,
                    questionType: q.type as any,
                    correctAnswer: q.correct,
                    explanation: q.explanation,
                    points: 10,
                    options: q.options // JSON storage for options
                }
            })
        }
        console.log(`   - Added ${bank.questions.length} questions.`)
    }

    console.log("🎉 Question Banks Seeded Successfully!")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
