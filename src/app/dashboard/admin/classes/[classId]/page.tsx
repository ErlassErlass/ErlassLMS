
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { getAnnouncements } from "@/app/actions/admin-class-actions"
import { ClassAnnouncementBoard } from "@/components/admin/class-announcement-board"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { BookOpenCheck, ArrowLeft } from "lucide-react"

export default async function ClassDetailPage({ params }: { params: Promise<{ classId: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/dashboard')

  const { classId } = await params
  
  // Verify Access
  const classData = await prisma.class.findUnique({
    where: { id: classId },
    include: {
        mentor: true,
        _count: { select: { students: true } }
    }
  })

  if (!classData) return <div>Class not found</div>

  const isSuperAdmin = session.user.role === 'SUPERADMIN'
  const isMentor = classData.mentor?.userId === session.user.id
  
  // Allow students of this class to view announcements too
  // We need to check if user is a student of this class
  let isStudent = false
  if (!isSuperAdmin && !isMentor) {
      const studentRecord = await prisma.user.findFirst({
          where: { id: session.user.id, classId: classId }
      })
      isStudent = !!studentRecord
  }

  if (!isSuperAdmin && !isMentor && !isStudent) {
      redirect('/dashboard')
  }

  // Fetch Announcements
  const announcementsRes = await getAnnouncements(classId)
  const announcements = announcementsRes.success ? announcementsRes.data : []

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-12">
        <div className="mb-6">
            <Link href={isSuperAdmin || isMentor ? "/dashboard/admin/classes" : "/dashboard"} className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" /> Kembali
            </Link>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-black text-[#1F2937] dark:text-white">{classData.name}</h1>
                <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="font-mono">{classData.code}</Badge>
                    <span className="text-sm text-gray-500">{classData._count.students} Siswa</span>
                </div>
            </div>

            {(isSuperAdmin || isMentor) && (
                <Link href={`/dashboard/admin/classes/${classId}/gradebook`}>
                    <Button variant="outline" className="gap-2">
                        <BookOpenCheck className="h-4 w-4" /> Buka Gradebook
                    </Button>
                </Link>
            )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <ClassAnnouncementBoard 
                    classId={classId} 
                    announcements={announcements as any[]} 
                    canPost={isSuperAdmin || isMentor} 
                />
            </div>
            
            <div className="space-y-6">
                {/* Info Panel could go here */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <h3 className="font-bold text-gray-700 mb-4">Informasi Kelas</h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Mentor</span>
                            <span className="font-medium text-gray-900">{classData.mentor?.bio || 'TBA'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Sekolah</span>
                            <span className="font-medium text-gray-900">{classData.school || '-'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}
