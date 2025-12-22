
import EnrollButton from "@/components/course/enroll-button"
import { ShareButton } from "@/components/course/share-button"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { notFound } from "next/navigation"
import { 
  BookOpen, 
  Clock, 
  PlayCircle, 
  CheckCircle, 
  Lock,
  Star,
  User,
  Trophy
} from "lucide-react"

interface CourseDetailPageProps {
  params: Promise<{
    courseId: string
  }>
}

async function getCourse(courseId: string, userId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      sections: {
        orderBy: { orderIndex: 'asc' }
      },
      createdBy: {
        select: {
          name: true,
          email: true,
          // avatar: true
        }
      }
    }
  })

  if (!course) return null

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId
      }
    }
  })

  // Get completed sections if enrolled
  let completedSectionIds: string[] = []
  if (enrollment) {
    const progress = await prisma.userProgress.findMany({
      where: {
        userId,
        courseId,
        completed: true
      },
      select: { sectionId: true }
    })
    completedSectionIds = progress.map(p => p.sectionId)
  }

  return { course, enrollment, completedSectionIds }
}

export const dynamic = 'force-dynamic'

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const resolvedParams = await params
  const { courseId } = resolvedParams
  
  const data = await getCourse(courseId, session.user.id)
  if (!data) notFound()

  const { course, enrollment, completedSectionIds } = data
  const isEnrolled = !!enrollment
  
  // Determine the next section to play
  let nextSectionId = course.sections[0]?.id
  if (isEnrolled && enrollment.currentSectionId) {
    nextSectionId = enrollment.currentSectionId
  } else if (completedSectionIds.length > 0) {
    // Find first uncompleted section
    const firstUncompleted = course.sections.find(s => !completedSectionIds.includes(s.id))
    if (firstUncompleted) nextSectionId = firstUncompleted.id
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-12">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-[#1F2937] dark:bg-gray-900 shadow-xl mb-10">
        {/* ... background pattern ... */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-secondary rounded-full blur-[100px] opacity-30"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-tertiary rounded-full blur-[100px] opacity-30"></div>
        </div>

        <div className="relative z-10 p-8 md:p-12">
          <div className="flex flex-col md:flex-row gap-8">
            {/* ... cover image ... */}
            <div className="w-full md:w-1/3 aspect-video md:aspect-square rounded-2xl bg-gray-700 flex items-center justify-center shadow-lg overflow-hidden relative group">
               {course.coverImage ? (
                 // eslint-disable-next-line @next/next/no-img-element
                 <img src={course.coverImage} alt={course.title} className="w-full h-full object-cover" />
               ) : (
                 <BookOpen className="h-24 w-24 text-gray-400" />
               )}
               {course.isPremium && (
                 <div className="absolute top-4 right-4 bg-[#FEEE91] text-[#F57F17] px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                   Premium
                 </div>
               )}
            </div>

            {/* Course Info */}
            <div className="flex-1 text-white">
              <div className="flex items-center gap-3 mb-4">
                <Badge className="bg-[#FF5656] hover:bg-[#CC0000] text-white border-none">
                  {course.category}
                </Badge>
                <Badge variant="outline" className="text-gray-300 border-gray-600">
                  {course.level}
                </Badge>
              </div>

              <h1 className="text-3xl md:text-4xl font-black mb-4 leading-tight">
                {course.title}
              </h1>
              
              <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                {course.description}
              </p>

              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400 mb-8">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{course.sections.length} Materi</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>~{course.totalSections * 15} Menit</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{course.createdBy.name}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                {isEnrolled ? (
                  <Link href={`/dashboard/courses/${course.id}/learn/${nextSectionId}`}>
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl h-14 px-8 shadow-lg hover:shadow-xl transition-all">
                      <PlayCircle className="mr-2 h-5 w-5" />
                      Lanjutkan Belajar
                    </Button>
                  </Link>
                ) : (
                  course.isPremium ? (
                    <Link href={`/dashboard/courses/${course.id}/checkout`}>
                       <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl h-14 px-8 shadow-lg hover:shadow-xl transition-all">
                        Beli Kursus
                      </Button>
                    </Link>
                  ) : (
                    <div className="w-full sm:w-auto">
                        <EnrollButton courseId={course.id} isEnrolled={isEnrolled} />
                    </div>
                  )
                )}
                
                <ShareButton url={`/dashboard/courses/${course.id}`} title={course.title} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ... rest of the component ... */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Syllabus / Sections */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border-2 border-gray-100 dark:border-gray-700 shadow-sm">
            <h2 className="text-2xl font-black text-[#1F2937] dark:text-white mb-6 flex items-center gap-2">
              <span className="w-3 h-8 bg-[#8CE4FF] rounded-full block"></span>
              Daftar Materi
            </h2>

            <div className="space-y-4">
              {course.sections.map((section, index) => {
                const isCompleted = completedSectionIds.includes(section.id)
                // Logic: Locked if NOT enrolled AND index >= freeSections
                // Unless section itself is explicitly free (override)
                const isLocked = !isEnrolled && (index >= course.freeSections) && !section.isFree 
                const isCurrent = section.id === nextSectionId

                return (
                  <Link 
                    key={section.id} 
                    href={!isLocked ? `/dashboard/courses/${course.id}/learn/${section.id}` : '#'}
                    className={`block group transition-all ${isLocked ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
                  >
                    <div className={`
                      relative p-5 rounded-2xl border-2 transition-all duration-200
                      ${isCurrent 
                        ? 'bg-[#E0F7FA] dark:bg-cyan-900/20 border-[#8CE4FF] dark:border-cyan-800' 
                        : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }
                    `}>
                      <div className="flex items-center gap-4">
                        <div className={`
                          w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-lg font-bold
                          ${isCompleted 
                            ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                            : isCurrent 
                              ? 'bg-[#0088CC] text-white shadow-md'
                              : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                          }
                        `}>
                          {isCompleted ? <CheckCircle className="h-6 w-6" /> : (isLocked ? <Lock className="h-5 w-5" /> : index + 1)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className={`font-bold text-lg mb-1 ${isCurrent ? 'text-[#0088CC] dark:text-cyan-400' : 'text-[#1F2937] dark:text-white'}`}>
                                {section.title}
                            </h3>
                            {!isEnrolled && !isLocked && <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 h-5 text-[10px]">GRATIS</Badge>}
                            {isLocked && <Badge variant="outline" className="text-gray-500 border-gray-300 h-5 text-[10px]">PREMIUM</Badge>}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <PlayCircle className="h-3 w-3" /> Video
                            </span>
                            {section.estimatedDuration && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {section.estimatedDuration} Menit
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-gray-400 dark:text-gray-500">
                          {isLocked ? (
                            <Lock className="h-5 w-5 text-gray-300" />
                          ) : (
                            <PlayCircle className={`h-6 w-6 group-hover:scale-110 transition-transform ${isCurrent ? 'text-[#0088CC] dark:text-cyan-400' : ''}`} />
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Instructor Card */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border-2 border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="font-bold text-[#1F2937] dark:text-white mb-4 uppercase tracking-wider text-sm">Mentor</h3>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
                {course.createdBy.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-lg text-[#1F2937] dark:text-white">{course.createdBy.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Senior Instructor</p>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-6 rounded-xl border-2 font-bold dark:bg-transparent dark:text-white dark:hover:bg-gray-700">
              Lihat Profil
            </Button>
          </div>

          {/* Course Stats Card */}
          <div className="bg-[#FFF3E0] dark:bg-orange-900/20 rounded-3xl p-6 border-2 border-[#FFA239] dark:border-orange-800/50">
            <h3 className="font-bold text-[#CC7000] dark:text-orange-400 mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Yang Akan Kamu Dapat
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-[#1F2937] dark:text-gray-200 font-medium text-sm">
                <CheckCircle className="h-5 w-5 text-[#FFA239] shrink-0" />
                Akses selamanya ke materi kursus
              </li>
              <li className="flex items-start gap-3 text-[#1F2937] dark:text-gray-200 font-medium text-sm">
                <CheckCircle className="h-5 w-5 text-[#FFA239] shrink-0" />
                Sertifikat kelulusan digital
              </li>
              <li className="flex items-start gap-3 text-[#1F2937] dark:text-gray-200 font-medium text-sm">
                <CheckCircle className="h-5 w-5 text-[#FFA239] shrink-0" />
                5 Project portofolio keren
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
