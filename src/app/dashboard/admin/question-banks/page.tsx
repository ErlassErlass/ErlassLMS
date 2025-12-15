import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus, FileText, Trash2, Edit, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { deleteQuestionBank } from "@/app/actions/question-bank-actions"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default async function QuestionBanksPage() {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'SUPERADMIN') redirect('/dashboard')

  const banks = await prisma.questionBank.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      _count: {
        select: { questions: true }
      }
    }
  })

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#1F2937] dark:text-white">Bank Soal</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Kelola soal dan kuis untuk kursus.</p>
        </div>
        <Link href="/dashboard/admin/question-banks/new">
          <Button className="bg-[#FF5656] hover:bg-[#CC0000] text-white font-bold rounded-xl shadow-md">
              <Plus className="mr-2 h-4 w-4" /> Buat Bank Soal
          </Button>
        </Link>
      </div>

      {banks.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-50 dark:bg-gray-800 border-dashed border-2 border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center p-8 text-center h-64 rounded-3xl">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Belum ada Bank Soal</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Mulai buat kumpulan soal untuk ujian atau latihan.</p>
              <Link href="/dashboard/admin/question-banks/new">
                <Button variant="outline">Buat Sekarang</Button>
              </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banks.map((bank) => (
            <div key={bank.id} className="bg-white dark:bg-gray-800 rounded-3xl p-6 border-2 border-gray-100 dark:border-gray-700 shadow-sm hover:border-[#FF5656] transition-all group relative">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-[#FFF3E0] dark:bg-orange-900/20 rounded-xl text-[#CC7000] dark:text-orange-400">
                  <FileText className="h-6 w-6" />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl">
                    <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                    <Link href={`/dashboard/admin/question-banks/${bank.id}`}>
                      <DropdownMenuItem className="cursor-pointer">
                        <Edit className="mr-2 h-4 w-4" /> Edit & Kelola Soal
                      </DropdownMenuItem>
                    </Link>
                    <form action={deleteQuestionBank.bind(null, bank.id) as any}>
                      <button type="submit" className="w-full text-left">
                        <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                          <Trash2 className="mr-2 h-4 w-4" /> Hapus
                        </DropdownMenuItem>
                      </button>
                    </form>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <h3 className="text-xl font-bold text-[#1F2937] dark:text-white mb-2 line-clamp-1">{bank.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2 h-10">
                {bank.description || "Tidak ada deskripsi"}
              </p>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                <span className="text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md uppercase">
                  {bank.difficulty}
                </span>
                <span className="text-sm font-bold text-[#FF5656]">
                  {bank._count.questions} Soal
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
