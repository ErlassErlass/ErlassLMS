import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Layers } from "lucide-react"
import { redirect } from "next/navigation"
import { CategoryActions } from "@/components/admin/category-actions"
import { CreateCategoryDialog } from "@/components/admin/create-category-dialog"

export default async function AdminCategoriesPage() {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'SUPERADMIN') redirect('/dashboard')

  const categories = await prisma.courseCategory.findMany({
    include: {
      _count: {
        select: { courses: true }
      }
    }
  })

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#1F2937] dark:text-white">Kategori Kursus</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Atur pengelompokan materi pembelajaran.</p>
        </div>
        
        <CreateCategoryDialog />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                <th className="p-6 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nama</th>
                <th className="p-6 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Slug</th>
                <th className="p-6 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Jumlah Kursus</th>
                <th className="p-6 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="p-6 font-bold text-[#1F2937] dark:text-white flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-500">
                        <Layers className="h-4 w-4" />
                    </div>
                    {cat.name}
                  </td>
                  <td className="p-6 text-gray-500 font-mono text-xs">{cat.slug}</td>
                  <td className="p-6">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {cat._count.courses} Kursus
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <CategoryActions category={cat} />
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">
                        Belum ada kategori. Silakan buat baru.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
