
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createCourse } from "@/app/actions/admin-course-actions"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"

export default async function NewCoursePage() {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'SUPERADMIN') redirect('/dashboard')

  const categories = await prisma.courseCategory.findMany({
    orderBy: { name: 'asc' }
  })

  async function handleCreate(formData: FormData) {
    'use server'
    const result = await createCourse(formData)
    if (result.success && result.courseId) {
        redirect(`/dashboard/admin/courses/${result.courseId}`)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <form action={handleCreate} className="w-full max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Mulai Kursus Baru</h1>
        <p className="text-gray-500 mb-8">Berikan judul awal untuk kursus Anda.</p>
        
        <div className="text-left space-y-2">
            <label className="font-bold text-sm">Judul Kursus</label>
            <input name="title" type="text" className="w-full border p-2 rounded-xl" placeholder="Contoh: Master Python 2025" required />
        </div>

        <div className="text-left space-y-2">
            <label className="font-bold text-sm">Kategori</label>
            <select name="category" className="w-full border p-2 rounded-xl bg-background">
                {categories.map(c => (
                    <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
                {categories.length === 0 && <option value="general">Umum (Default)</option>}
            </select>
        </div>

        <input type="hidden" name="level" value="Beginner" />

        <div className="text-left space-y-2">
            <label className="font-bold text-sm">Gambar Sampul (Opsional)</label>
            <input type="file" name="coverImageFile" className="w-full border p-2 rounded-xl bg-background" accept="image/*" />
        </div>

        <button type="submit" className="w-full bg-[#FF5656] text-white font-bold py-3 rounded-xl hover:bg-[#CC0000] transition-colors">
            Buat Draft & Lanjut Edit →
        </button>
      </form>
    </div>
  )
}
