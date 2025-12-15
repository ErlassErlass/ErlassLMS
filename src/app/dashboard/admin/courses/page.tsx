
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, Eye, EyeOff, BookOpen, MoreHorizontal, Upload } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

import { deleteCourse } from "@/app/actions/admin-course-actions"

export default async function AdminCoursesPage() {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'SUPERADMIN') redirect('/dashboard')

  const courses = await prisma.course.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      _count: {
        select: {
          enrollments: true,
          sections: true
        }
      }
    }
  })

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#1F2937] dark:text-white">Manajemen Kursus</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Buat dan kelola materi pembelajaran.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/admin/courses/import">
            <Button variant="outline" className="font-bold rounded-xl border-2">
              <Upload className="mr-2 h-4 w-4" /> Bulk Import
            </Button>
          </Link>
          <Link href="/dashboard/admin/courses/new">
            <Button className="bg-[#FF5656] hover:bg-[#CC0000] text-white font-bold rounded-xl shadow-md">
              <Plus className="mr-2 h-4 w-4" /> Buat Kursus
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                <th className="p-6 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kursus</th>
                <th className="p-6 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="p-6 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Harga</th>
                <th className="p-6 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Siswa</th>
                <th className="p-6 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0 overflow-hidden">
                        {course.coverImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={course.coverImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <BookOpen className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-[#1F2937] dark:text-white">{course.title}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                          <span>{course._count.sections} Materi</span>
                          <span>•</span>
                          <span className="capitalize">{course.category}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    {course.isPublished ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none">Published</Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-500 border-gray-300">Draft</Badge>
                    )}
                  </td>
                  <td className="p-6 font-medium text-[#1F2937] dark:text-white">
                    {course.price === 0 ? 'Gratis' : `Rp ${course.price.toLocaleString()}`}
                  </td>
                  <td className="p-6 text-[#1F2937] dark:text-white">
                    {course._count.enrollments}
                  </td>
                  <td className="p-6 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                        <Link href={`/dashboard/admin/courses/${course.id}`}>
                          <DropdownMenuItem className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" /> Edit Kursus
                          </DropdownMenuItem>
                        </Link>
                        <Link href={`/dashboard/courses/${course.id}`} target="_blank">
                          <DropdownMenuItem className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" /> Lihat Halaman
                          </DropdownMenuItem>
                        </Link>
                        <form action={deleteCourse.bind(null, course.id) as any}>
                          <button type="submit" className="w-full text-left">
                            <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                              <Trash2 className="mr-2 h-4 w-4" /> Hapus Kursus
                            </DropdownMenuItem>
                          </button>
                        </form>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
