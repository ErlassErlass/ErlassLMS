
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, Plus, Trash2, GripVertical, Video, FileText, Edit } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { updateCourse, createSection, deleteSection, updateSection } from "@/app/actions/admin-course-actions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createQuiz, deleteQuiz } from "@/app/actions/admin-quiz-actions"
import { HelpCircle, MoreHorizontal, Trash } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SectionMenu } from "./SectionMenu"
import { EditSectionDialog } from "./EditSectionDialog"

// Helper to get course
async function getCourse(courseId: string) {
  return await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      sections: {
        orderBy: { orderIndex: 'asc' },
        include: {
            quizzes: true
        }
      }
    }
  })
}

export default async function EditCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'SUPERADMIN') redirect('/dashboard')

  const { courseId } = await params
  const course = await getCourse(courseId)
  
  if (!course) redirect('/dashboard/admin/courses')

  // Fetch categories for dropdown
  const categories = await prisma.courseCategory.findMany({ orderBy: { name: 'asc' } })

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-12 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/admin/courses">
          <Button variant="outline" size="icon" className="rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-black text-[#1F2937] dark:text-white">Edit Kursus</h1>
      </div>

      <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
        {/* Left Column: Course Details */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700 shadow-sm">
            <CardHeader>
              <CardTitle>Informasi Dasar</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={updateCourse.bind(null, course.id) as any} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Judul Kursus</Label>
                  <Input id="title" name="title" defaultValue={course.title} required className="rounded-xl" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea id="description" name="description" defaultValue={course.description || ''} className="h-32 rounded-xl" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Kategori</Label>
                    <select id="category" name="category" defaultValue={course.categoryId || ""} className="w-full p-2 rounded-xl border bg-background h-10">
                      {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                      {categories.length === 0 && <option value="general">Umum (Default)</option>}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="level">Level</Label>
                    <select id="level" name="level" defaultValue={course.level} className="w-full p-2 rounded-xl border bg-background h-10">
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Harga (Rp)</Label>
                    <Input type="number" id="price" name="price" defaultValue={course.price} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="freeSections">Jumlah Materi Gratis</Label>
                    <Input type="number" id="freeSections" name="freeSections" defaultValue={course.freeSections} className="rounded-xl" />
                    <p className="text-[10px] text-gray-500">Contoh: 3 (Bab 1-3 Gratis, sisanya dikunci)</p>
                  </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="coverImageFile">Upload Gambar Sampul</Label>
                    <Input type="file" id="coverImageFile" name="coverImageFile" accept="image/*" className="rounded-xl bg-white dark:bg-gray-900" />
                    <input type="hidden" name="coverImage" value={course.coverImage || ''} />
                    {course.coverImage && (
                        <div className="mt-2 relative w-32 h-20 rounded-lg overflow-hidden border">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={course.coverImage} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="space-y-0.5">
                    <Label className="text-base">Status Publikasi</Label>
                    <p className="text-xs text-gray-500">Kursus akan terlihat oleh siswa jika diaktifkan.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                        type="checkbox" 
                        name="isPublished" 
                        id="isPublished" 
                        defaultChecked={course.isPublished}
                        className="w-5 h-5"
                    />
                    <Label htmlFor="isPublished">Publish</Label>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-[#1F2937] text-white rounded-xl">Simpan Perubahan</Button>
              </form>
            </CardContent>
          </Card>

          {/* Sections List */}
          <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Materi / Bab ({course.sections.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {course.sections.map((section, index) => (
                  <div key={section.id} className="group flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-all">
                    <div className="mt-1 text-gray-400">
                      <GripVertical className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-[#E0F7FA] text-[#0088CC] text-xs font-bold px-2 py-0.5 rounded-md">Bab {index + 1}</span>
                        {section.isFree && <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-md">Gratis</span>}
                      </div>
                      <h3 className="font-bold text-[#1F2937] dark:text-white">{section.title}</h3>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Video className="h-3 w-3" /> {section.videoUrl ? 'Video Ada' : 'No Video'}</span>
                        <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> {section.content ? 'Teks Ada' : 'No Content'}</span>
                        <span className="flex items-center gap-1 text-orange-500 font-bold"><HelpCircle className="h-3 w-3" /> {section.quizzes?.length || 0} Kuis</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      
                      {/* Section Menu (Quiz Management) */}
                      <SectionMenu courseId={course.id} sectionId={section.id} quizzes={section.quizzes} />

                      {/* Edit Section Dialog */}
                      <EditSectionDialog section={section} />

                      {/* Delete Section Button Form */}
                      <form action={deleteSection.bind(null, section.id, course.id) as any}>
                        <Button size="icon" variant="ghost" className="text-red-500 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Add New Section */}
        <div className="space-y-8">
          <Card className="rounded-3xl border-2 border-gray-100 dark:border-gray-700 shadow-sm sticky top-24">
            <CardHeader>
              <CardTitle>Tambah Materi Baru</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={createSection.bind(null, course.id) as any} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sec_title">Judul Bab</Label>
                  <Input id="sec_title" name="title" placeholder="Contoh: Pengenalan Variabel" required className="rounded-xl" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sec_desc">Deskripsi Singkat</Label>
                  <Textarea id="sec_desc" name="description" placeholder="Ringkasan materi..." className="h-20 rounded-xl" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sec_video">Video URL (Opsional)</Label>
                  <Input id="sec_video" name="videoUrl" placeholder="Youtube / MP4 Link" className="rounded-xl" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sec_content">Konten Teks (HTML/Markdown)</Label>
                  <Textarea id="sec_content" name="content" placeholder="Isi materi pelajaran..." className="h-40 rounded-xl font-mono text-sm" />
                </div>

                <div className="flex items-center gap-2">
                    <input type="checkbox" name="isFree" id="sec_isFree" className="w-4 h-4" />
                    <Label htmlFor="sec_isFree">Gratis (Trial)</Label>
                </div>

                <input type="hidden" name="orderIndex" value={course.sections.length} />

                <Button type="submit" className="w-full bg-[#FF5656] hover:bg-[#CC0000] text-white font-bold rounded-xl">
                  <Plus className="mr-2 h-4 w-4" /> Tambah Bab
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
