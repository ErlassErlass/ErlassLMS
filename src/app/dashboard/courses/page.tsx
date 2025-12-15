// app/dashboard/courses/page.tsx - Updated dengan real data
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ProgressService } from "@/lib/services/progress-service"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BookOpen, Clock, Users, Star, PlayCircle } from "lucide-react"

import { prisma } from "@/lib/db"

export default async function CoursesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) return null

  // Get user enrollments dengan progress
  const enrollments = await ProgressService.getUserEnrollments(session.user.id)
  const enrolledCourseIds = enrollments.map(e => e.course.id)
  
  // Get all available courses that are NOT enrolled
  const availableCourses = await prisma.course.findMany({
    where: {
      isPublished: true,
      id: { notIn: enrolledCourseIds }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-12">
      <div className="mb-8 bg-[#E0F7FA] dark:bg-cyan-900/30 p-6 rounded-3xl border border-[#8CE4FF] dark:border-cyan-800">
        <h1 className="text-3xl font-black text-[#1F2937] dark:text-white mb-2">Kursus Erlass 📚</h1>
        <p className="text-gray-600 dark:text-gray-300 font-medium">
          Pilih petualangan belajarmu hari ini!
        </p>
      </div>

      {/* Course Categories */}
      <div className="flex space-x-3 mb-10 overflow-x-auto pb-4 scrollbar-hide">
        <Button variant="default" className="bg-[#FF5656] hover:bg-[#CC0000] text-white rounded-full px-6 font-bold shadow-md whitespace-nowrap">
          Semua Kursus
        </Button>
        <Button variant="outline" className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-[#FF5656] hover:text-[#FF5656] rounded-full px-6 font-bold whitespace-nowrap">
          Scratch
        </Button>
        <Button variant="outline" className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-[#FFA239] hover:text-[#FFA239] rounded-full px-6 font-bold whitespace-nowrap">
          Pictoblox
        </Button>
        <Button variant="outline" className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-[#8CE4FF] hover:text-[#0088CC] rounded-full px-6 font-bold whitespace-nowrap">
          Microbit
        </Button>
      </div>

      {/* Enrolled Courses */}
      {enrollments.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-black text-[#1F2937] dark:text-white mb-6 flex items-center gap-2">
            <span className="w-3 h-8 bg-[#FFA239] rounded-full block"></span>
            Sedang Dipelajari
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment) => (
              <EnrolledCourseCard 
                key={enrollment.id} 
                enrollment={enrollment} 
              />
            ))}
          </div>
        </div>
      )}

      {/* Available Courses */}
      <div>
        <h2 className="text-2xl font-black text-[#1F2937] dark:text-white mb-6 flex items-center gap-2">
           <span className="w-3 h-8 bg-[#8CE4FF] rounded-full block"></span>
          {enrollments.length > 0 ? 'Kursus Lainnya' : 'Kursus Tersedia'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableCourses.map((course) => (
            <AvailableCourseCard 
              key={course.id} 
              course={course} 
            />
          ))}
        </div>
      </div>

      {/* Empty State */}
      {enrollments.length === 0 && availableCourses.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-[#1F2937] dark:text-white mb-2">Belum ada kursus tersedia</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Kursus sedang dalam persiapan. Nantikan ya!</p>
          <Button variant="outline" className="rounded-xl">
            Notifikasi Saya
          </Button>
        </div>
      )}
    </div>
  )
}

// Component untuk course yang sudah di-enroll
function EnrolledCourseCard({ enrollment }: { enrollment: any }) {
  const progress = Math.round(enrollment.progressPercentage)
  const currentSection = enrollment.course.sections.find(
    (s: any) => s.id === enrollment.currentSectionId
  ) || enrollment.course.sections[0]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border-2 border-gray-100 dark:border-gray-700 overflow-hidden hover:border-accent hover:-translate-y-1 transition-all duration-300 group">
      <div className="h-48 bg-secondary flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <BookOpen className="h-20 w-20 text-white drop-shadow-lg transform group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/30">
           {progress}% Selesai
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-[#E0F7FA] dark:bg-cyan-900/30 text-[#0088CC] dark:text-cyan-400 border border-[#8CE4FF] dark:border-cyan-800">
            {enrollment.course.category.toUpperCase()}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
            {enrollment.course.level}
          </span>
        </div>

        <h3 className="text-xl font-black text-[#1F2937] dark:text-white mb-2 line-clamp-1 group-hover:text-[#FF5656] transition-colors">
          {enrollment.course.title}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-5 line-clamp-2 font-medium">
          {enrollment.course.description}
        </p>

        {/* Progress Bar */}
        <div className="mb-5">
          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-primary h-full rounded-full transition-all duration-500 relative"
              style={{ width: `${progress}%` }}
            >
            </div>
          </div>
        </div>

        {/* Current Section */}
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-5 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
          <span className="font-bold text-[#1F2937] dark:text-white block mb-1">Materi Sekarang: </span>
          <span className="line-clamp-1">{currentSection?.title || 'Belum mulai'}</span>
        </div>

        {/* Action Button */}
        <div className="flex space-x-3">
          <Link 
            href={currentSection ? 
              `/dashboard/courses/${enrollment.course.id}/sections/${currentSection.id}` : 
              `/dashboard/courses/${enrollment.course.id}`
            }
            className="flex-1"
          >
            <Button className="w-full bg-[#1F2937] dark:bg-white hover:bg-black dark:hover:bg-gray-200 text-white dark:text-black font-bold rounded-xl h-11 shadow-md hover:shadow-lg transition-all">
              <PlayCircle className="h-5 w-5 mr-2" />
              {progress > 0 ? 'Lanjut Belajar' : 'Mulai Belajar'}
            </Button>
          </Link>
          <Link href={`/dashboard/courses/${enrollment.course.id}`}>
            <Button variant="outline" className="rounded-xl h-11 border-2 font-bold hover:bg-gray-50 dark:hover:bg-gray-800">
              Detail
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

// Component untuk course yang tersedia
function AvailableCourseCard({ course }: { course: any }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border-2 border-gray-100 dark:border-gray-700 overflow-hidden hover:border-[#8CE4FF] hover:-translate-y-1 transition-all duration-300 group">
      <div className="h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center relative overflow-hidden">
         {course.coverImage ? (
             // eslint-disable-next-line @next/next/no-img-element
             <img src={course.coverImage} alt={course.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
         ) : (
            <BookOpen className="h-16 w-16 text-gray-400 dark:text-gray-500" />
         )}
         {course.isPremium && (
             <div className="absolute top-4 right-4 bg-[#FEEE91] text-[#F57F17] px-3 py-1 rounded-full text-xs font-bold border border-[#FBC02D] shadow-sm flex items-center">
                 <Star className="w-3 h-3 mr-1 fill-current" /> Premium
             </div>
         )}
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-[#E0F7FA] dark:bg-cyan-900/30 text-[#0088CC] dark:text-cyan-400 border border-[#8CE4FF] dark:border-cyan-800">
            {course.category.toUpperCase()}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
            {course.level}
          </span>
        </div>

        <h3 className="text-xl font-black text-[#1F2937] dark:text-white mb-2 line-clamp-1 group-hover:text-[#0088CC] dark:group-hover:text-cyan-400 transition-colors">
          {course.title}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-5 line-clamp-2 font-medium">
          {course.description}
        </p>

        {/* Course Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-6 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4 text-[#8CE4FF] dark:text-cyan-400" />
            <span className="font-bold">{course.totalSections} Bab</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-[#FFA239] dark:text-amber-400" />
            <span className="font-bold">~4 Minggu</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between gap-4">
          <div className="text-lg font-black text-[#FF5656] dark:text-red-400">
            {course.price === 0 ? 'Gratis!' : `Rp ${course.price.toLocaleString()}`}
          </div>
          <Link href={`/dashboard/courses/${course.id}`} className="flex-1">
            <Button className="w-full bg-[#1F2937] dark:bg-white hover:bg-black dark:hover:bg-gray-200 text-white dark:text-black font-bold rounded-xl h-11 shadow-md hover:shadow-lg transition-all">
              {course.price === 0 ? 'Mulai Sekarang' : 'Lihat Detail'}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}