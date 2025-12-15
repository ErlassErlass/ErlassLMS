import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { 
  ChevronLeft, 
  PlayCircle, 
  BookOpen,
  CheckCircle
} from "lucide-react"
import { SectionNavigation } from "@/components/course/section-navigation"
import QuizRunner from "@/components/quiz/quiz-runner"

interface SectionPageProps {
  params: Promise<{
    courseId: string
    sectionId: string
  }>
}

async function getSectionData(courseId: string, sectionId: string, userId: string, role: string) {
  // 1. Fetch Course with all sections (lightweight) for sidebar
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      sections: {
        orderBy: { orderIndex: 'asc' }
      }
    }
  })

  if (!course) return null

  // 2. Fetch specific section with full content and quizzes
  const section = await prisma.courseSection.findUnique({
    where: { id: sectionId },
    include: {
      quizzes: {
        where: { isActive: true },
        include: {
            questions: {
                orderBy: { order: 'asc' },
                include: {
                    question: true
                }
            }
        }
      }
    }
  })
  
  if (!section) return null

  // Verify enrollment
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId
      }
    }
  })

  // Access Check:
  // 1. If enrolled, ALLOW
  // 2. If section explicitly free, ALLOW
  // 3. If index < freeSections, ALLOW
  // 4. If SUPERADMIN, ALLOW (Bypass)
  // Otherwise, REDIRECT to checkout
  const isFreeSection = (section.orderIndex < course.freeSections) || section.isFree
  const isSuperAdmin = role === 'SUPERADMIN'
  
  if (!enrollment && !isFreeSection && !isSuperAdmin) {
    return { redirect: course.isPremium ? `/dashboard/courses/${courseId}/checkout` : `/dashboard/courses/${courseId}` }
  }

  // Get progress
  const progress = await prisma.userProgress.findUnique({
    where: {
      userId_sectionId: {
        userId,
        sectionId
      }
    }
  })
  
  // Get all completed sections for sidebar
  const allProgress = await prisma.userProgress.findMany({
    where: {
        userId,
        courseId,
        completed: true
    },
    select: { sectionId: true }
  })
  const completedSectionIds = allProgress.map(p => p.sectionId)

  return { course, section, enrollment, isCompleted: progress?.completed || false, completedSectionIds }
}

export default async function SectionPage({ params }: SectionPageProps) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/signin")

  const resolvedParams = await params
  const { courseId, sectionId } = resolvedParams
  
  const data = await getSectionData(courseId, sectionId, session.user.id, session.user.role)
  if (!data) notFound()
  if ('redirect' in data) redirect(data.redirect as string)

  const { course, section, isCompleted, completedSectionIds } = data
  
  const currentIndex = course.sections.findIndex(s => s.id === section.id)
  const prevSection = currentIndex > 0 ? course.sections[currentIndex - 1] : null
  const nextSection = currentIndex < course.sections.length - 1 ? course.sections[currentIndex + 1] : null

  return (
    <div className="flex h-screen flex-col md:flex-row overflow-hidden bg-[#0a0a0a]">
      {/* Sidebar (Playlist) */}
      <div className="w-full md:w-80 bg-[#111] border-r border-gray-800 flex flex-col shrink-0">
        {/* ... Sidebar content ... */}
        <div className="p-4 border-b border-gray-800 flex items-center gap-3">
          <Link href={`/dashboard/courses/${course.id}`}>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h2 className="font-bold text-white truncate">{course.title}</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {course.sections.map((s, idx) => {
            const isActive = s.id === section.id
            const isSectionCompleted = completedSectionIds.includes(s.id)
            return (
              <Link key={s.id} href={`/dashboard/courses/${course.id}/sections/${s.id}`}>
                <div className={`
                  p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-all
                  ${isActive 
                    ? 'bg-[#FF5656] text-white shadow-lg' 
                    : 'hover:bg-gray-800 text-gray-400 hover:text-white'
                  }
                `}>
                  <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                    ${isSectionCompleted 
                        ? 'bg-green-500 text-white' 
                        : isActive ? 'bg-white text-[#FF5656]' : 'bg-gray-800'}
                  `}>
                    {isSectionCompleted ? <CheckCircle className="h-4 w-4" /> : idx + 1}
                  </div>
                  <div className="flex-1 text-sm font-medium truncate">
                    {s.title}
                  </div>
                  {isActive && <PlayCircle className="h-4 w-4" />}
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Main Player Area */}
      <div className="flex-1 flex flex-col overflow-y-auto bg-[#0a0a0a]">
        {/* Video/Content Container */}
        <div className="aspect-video bg-black relative flex items-center justify-center border-b border-gray-800">
          {section.videoUrl ? (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              {/* Placeholder for Video Player */}
              <div className="text-center">
                <PlayCircle className="h-16 w-16 mx-auto mb-4 text-[#FF5656] opacity-80 hover:scale-110 transition-transform cursor-pointer" />
                <p>Video Player Placeholder</p>
                <p className="text-xs mt-2">{section.videoUrl}</p>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-[#8CE4FF]" />
              <p>Materi Bacaan</p>
            </div>
          )}
        </div>

        {/* Content & Navigation */}
        <div className="p-6 md:p-8 max-w-4xl mx-auto w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white mb-2">{section.title}</h1>
              <p className="text-gray-400">{section.description}</p>
            </div>
            
            {/* Navigation Component */}
            <SectionNavigation 
                courseId={course.id}
                sectionId={section.id}
                prevSectionId={prevSection?.id}
                nextSectionId={nextSection?.id}
                isCompleted={isCompleted}
            />
          </div>

          {/* Text Content */}
          <div className="prose prose-invert max-w-none mb-12">
            <div className="bg-gray-900 rounded-2xl p-6 md:p-8 border border-gray-800 text-gray-300 leading-relaxed">
              {section.content ? (
                <div dangerouslySetInnerHTML={{ __html: section.content }} />
              ) : (
                <p className="italic text-gray-500">Belum ada konten teks untuk materi ini.</p>
              )}
            </div>
          </div>

          {/* Quiz Section (If Available) */}
          {section.quizzes && section.quizzes.length > 0 && (
            <div className="mb-12">
                <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
                    <div className="w-10 h-10 bg-[#FFF3E0] rounded-xl flex items-center justify-center text-[#CC7000]">
                        <CheckCircle className="h-6 w-6" />
                    </div>
                    Kuis: {section.quizzes[0].title}
                </h2>
                <QuizRunner quiz={section.quizzes[0]} userId={session.user.id} />
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

