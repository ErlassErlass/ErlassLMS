
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { createQuestionBank } from "@/app/actions/question-bank-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default async function NewQuestionBankPage() {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'SUPERADMIN') redirect('/dashboard')

  async function handleCreate(formData: FormData) {
    'use server'
    const result = await createQuestionBank(formData)
    if (result.success && result.bankId) {
        redirect(`/dashboard/admin/question-banks/${result.bankId}`)
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-12 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/admin/question-banks">
          <Button variant="outline" size="icon" className="rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-black text-[#1F2937] dark:text-white">Buat Bank Soal Baru</h1>
      </div>

      <form action={handleCreate} className="space-y-6 bg-white dark:bg-gray-800 p-8 rounded-3xl border-2 border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="space-y-2">
          <Label htmlFor="title">Judul Bank Soal</Label>
          <Input id="title" name="title" placeholder="Contoh: Latihan Python Dasar" required className="rounded-xl" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Deskripsi</Label>
          <Textarea id="description" name="description" placeholder="Deskripsi singkat tentang kumpulan soal ini..." className="rounded-xl h-32" />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="category">Kategori</Label>
                <select id="category" name="category" className="w-full p-2 rounded-xl border bg-background">
                    <option value="scratch">Scratch</option>
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="web">Web Development</option>
                    <option value="general">Umum</option>
                </select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="difficulty">Tingkat Kesulitan</Label>
                <select id="difficulty" name="difficulty" className="w-full p-2 rounded-xl border bg-background">
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                </select>
            </div>
        </div>

        <Button type="submit" className="w-full bg-[#FF5656] hover:bg-[#CC0000] text-white font-bold rounded-xl py-6">
            Buat & Tambah Soal
        </Button>
      </form>
    </div>
  )
}
