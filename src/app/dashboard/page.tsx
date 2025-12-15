import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  BookOpen, 
  Trophy, 
  Award,
  TrendingUp,
  Clock,
  Users,
  FileText,
  Download,
  Medal
} from "lucide-react"

import { checkDailyLogin, getDailyQuests } from "@/app/actions/daily-actions"
import { DailyQuestCard } from "@/components/dashboard/DailyQuestCard"

import { OnboardingTour } from "@/components/dashboard/OnboardingTour"

async function getDashboardData(userId: string, role?: string) {
  // Trigger Daily Login Check (Side effect: updates streak and creates quests)
  await checkDailyLogin(userId)

  // Fetch real user data for Gamification Stats
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { 
        xp: true,
        level: true,
        currentStreak: true
    }
  });

  const dailyQuests = await getDailyQuests(userId)

  const enrolledCourses = await prisma.enrollment.count({
    where: {
      userId: userId,
      status: 'ENROLLED'
    }
  });

  const completedChallenges = await prisma.challengeSubmission.count({
    where: {
      userId: userId,
      passed: true
    }
  });

  const totalCertificates = await prisma.certificate.count({
    where: { userId: userId }
  });

  const totalBadges = await prisma.userBadge.count({
    where: { userId: userId }
  });

  const latestCertificate = await prisma.certificate.findFirst({
    where: { userId: userId },
    orderBy: { issuedAt: 'desc' },
    select: { serialNumber: true }
  });

  // Fetch Mentor Classes if applicable
  let mentorClasses: any[] = [];
  if (role === 'MENTOR') {
    const mentor = await prisma.mentor.findUnique({
      where: { userId: userId }
    });
    
    if (mentor) {
      const classes = await prisma.class.findMany({
        where: { mentorId: mentor.id },
        include: {
          _count: {
            select: { students: true }
          }
        }
      });
      
      mentorClasses = classes.map(c => ({
        id: c.id,
        name: c.name,
        code: c.code,
        studentCount: c._count.students
      }));
    }
  }

  // Current Streak Real
  const currentStreak = user?.currentStreak || 0; 

  const activeCourses = await prisma.enrollment.findMany({
    where: {
      userId: userId,
      status: 'ENROLLED'
    },
    include: {
      course: true
    },
    take: 3
  });

  // Transform to required format with progress calculation
  const activeCoursesFormatted = activeCourses.map(enrollment => {
    // Use real progress from database if available, fallback to stored percentage
    const progress = Math.round(enrollment.progressPercentage || 0);
    return {
      id: enrollment.course.id,
      title: enrollment.course.title,
      progress
    };
  });

  const recentChallenges = await prisma.challengeSubmission.findMany({
    where: {
      userId: userId
    },
    include: {
      challenge: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    distinct: ['challengeId'], // Ensure unique challenges
    take: 3
  });

  // Transform to required format
  const recentChallengesFormatted = recentChallenges.map(submission => {
    let status = 'pending';
    if (submission.passed) status = 'completed';
    else if (submission.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000)) status = 'in-progress'; // If submitted in last 24 hours

    return {
      id: submission.challenge.id,
      title: submission.challenge.title,
      status,
      points: submission.challenge.points
    };
  });

  return {
    enrolledCourses,
    completedChallenges,
    currentStreak,
    xp: user?.xp || 0,
    level: user?.level || 1,
    totalCertificates,
    totalBadges,
    latestCertificateSerialNumber: latestCertificate?.serialNumber,
    activeCourses: activeCoursesFormatted,
    recentChallenges: recentChallengesFormatted,
    mentorClasses,
    dailyQuests
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const data = await getDashboardData(session.user.id, session.user.role)

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-12">
      <OnboardingTour />
      
      {/* Modern Hero Banner */}
      <div id="dashboard-welcome" className="relative mb-10 overflow-hidden rounded-3xl bg-secondary shadow-xl">
        <div className="relative px-8 py-12 flex flex-col md:flex-row items-center justify-between">
          <div className="text-white z-10 max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 drop-shadow-sm text-white opacity-100">
              Halo, {session.user.name}! 🚀
            </h1>
            <p className="text-lg md:text-xl font-medium text-white/90 drop-shadow-sm">
              Siap untuk petualangan coding hari ini? Ayo lanjutkan belajarmu!
            </p>
            <div className="mt-6 flex gap-3">
              <Link href="/dashboard/courses">
                <Button className="bg-white text-secondary hover:bg-gray-50 font-bold border-2 border-transparent hover:border-white transition-all rounded-full px-6">
                  Lanjut Belajar
                </Button>
              </Link>
              {session.user.role === 'MENTOR' && (
                  <Link href="/dashboard/admin/classes">
                    <Button className="bg-erlass-primary text-white hover:bg-erlass-primary/90 font-bold border-2 border-transparent hover:border-white transition-all rounded-full px-6">
                      Manage Classes
                    </Button>
                  </Link>
              )}
            </div>
          </div>
          {/* Decorative Element */}
          <div className="hidden md:block absolute right-10 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm p-6 rounded-full border-4 border-white/20 rotate-12">
            <Trophy className="h-24 w-24 text-white drop-shadow-md" />
          </div>
        </div>
      </div>

      {/* Mentor Classes Section */}
      {data.mentorClasses && data.mentorClasses.length > 0 && (
        <div className="mb-10">
           <h2 className="text-2xl font-black text-[#1F2937] dark:text-white flex items-center gap-2 mb-6">
              <span className="bg-erlass-primary w-2 h-8 rounded-full block"></span>
              Kelas Saya
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {data.mentorClasses.map((cls: any) => (
                 <div key={cls.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-4">
                        <div className="bg-erlass-primary/10 p-3 rounded-xl">
                           <Users className="h-6 w-6 text-erlass-primary" />
                        </div>
                        <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300">
                           {cls.code}
                        </span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-2">{cls.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                       <Users className="h-4 w-4" />
                       <span>{cls.studentCount} Students</span>
                    </div>
                 </div>
               ))}
            </div>
        </div>
      )}

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Stat Card 1: Daily Quests */}
        <div id="daily-quests" className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-b-4 border-[#8CE4FF] shadow-sm hover:-translate-y-1 transition-transform duration-200 col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <div className="bg-[#E0F7FA] dark:bg-cyan-900/30 p-3 rounded-xl">
                    <Clock className="h-6 w-6 text-[#0088CC] dark:text-cyan-400" />
                </div>
                <h3 className="text-gray-700 dark:text-gray-300 text-lg font-bold tracking-tight">Misi Harian</h3>
            </div>
            <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
              Reset dalam 12j
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.dailyQuests && data.dailyQuests.length > 0 ? (
                data.dailyQuests.map((quest: any) => (
                    <DailyQuestCard key={quest.id} quest={quest} />
                ))
            ) : (
                <p className="text-sm text-gray-500">Memuat misi...</p>
            )}
          </div>
        </div>

        {/* Stat Card 3: Achievements */}
        <div id="xp-shop-card" className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-b-4 border-[#FEEE91] shadow-sm hover:-translate-y-1 transition-transform duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
                <div className="bg-[#FFFDE7] dark:bg-yellow-900/30 p-3 rounded-xl">
                <Award className="h-6 w-6 text-[#F57F17] dark:text-yellow-400" />
                </div>
                <span className="text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                Pencapaian
                </span>
            </div>
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider">Koleksi</h3>
            <div className="flex gap-3 mt-1 mb-4">
                <div className="flex items-center gap-1" title="Badges">
                    <Medal className="h-4 w-4 text-orange-500" />
                    <span className="text-2xl font-black text-[#1F2937] dark:text-white">{data.totalBadges}</span>
                </div>
                <div className="w-px bg-gray-300 h-8"></div>
                <div className="flex items-center gap-1" title="Sertifikat">
                    <FileText className="h-4 w-4 text-green-600" />
                    <span className="text-2xl font-black text-[#1F2937] dark:text-white">{data.totalCertificates}</span>
                </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            {data.latestCertificateSerialNumber && (
                 <a href={`/api/certificates/${data.latestCertificateSerialNumber}/download`} target="_blank" className="w-full">
                    <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-8 text-xs gap-1 shadow-sm">
                        <Download className="h-3 w-3" /> Sertifikat Terbaru
                    </Button>
                </a>
            )}
            
            <div className="flex gap-2">
                <Link href="/dashboard/profile#certificates" className="flex-1">
                    <Button size="sm" variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 font-bold h-8 text-xs gap-1">
                        <FileText className="h-3 w-3" /> Arsip
                    </Button>
                </Link>
                <Link href="/dashboard/profile#badges" className="flex-1">
                    <Button size="sm" variant="outline" className="w-full border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700 font-bold h-8 text-xs gap-1">
                        <Medal className="h-3 w-3" /> Badges
                    </Button>
                </Link>
            </div>
          </div>
        </div>

        {/* Stat Card 4: Level */}
        <div className="bg-[#1F2937] rounded-2xl p-6 border-b-4 border-[#4B5563] shadow-sm text-white hover:-translate-y-1 transition-transform duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gray-700 p-3 rounded-xl">
              <TrendingUp className="h-6 w-6 text-[#FFA239]" />
            </div>
            <span className="text-xs font-bold bg-gray-700 text-[#FFA239] px-2 py-1 rounded-full border border-[#FFA239]">
              Level Up!
            </span>
          </div>
          <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider">Level Saat Ini</h3>
          <p className="text-4xl font-black text-white mt-1">{data.level}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Courses Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-[#1F2937] dark:text-white flex items-center gap-2">
              <span className="bg-[#FF5656] w-2 h-8 rounded-full block"></span>
              Lanjutkan Belajar
            </h2>
            <Link href="/dashboard/courses">
              <Button variant="ghost" className="text-[#FF5656] hover:bg-[#FF5656]/10 font-bold">
                Lihat Semua →
              </Button>
            </Link>
          </div>

          <div className="grid gap-4">
            {data.activeCourses.map((course) => (
              <div id="active-course-card" key={course.id} className="group bg-white dark:bg-gray-800 rounded-2xl p-5 border-2 border-gray-100 dark:border-gray-700 hover:border-tertiary dark:hover:border-tertiary shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row items-center gap-6">
                {/* Icon/Image Placeholder */}
                <div className="w-16 h-16 bg-tertiary/10 dark:bg-cyan-900/30 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <BookOpen className="h-8 w-8 text-tertiary dark:text-cyan-400" />
                </div>
                
                <div className="flex-1 w-full">
                  <h3 className="font-bold text-lg text-[#1F2937] dark:text-white mb-1 group-hover:text-tertiary dark:group-hover:text-cyan-400 transition-colors">{course.title}</h3>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-tertiary rounded-full transition-all duration-500"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-tertiary dark:text-cyan-400">{course.progress}%</span>
                  </div>
                </div>

                <Link href={`/dashboard/courses/${course.id}`}>
                  <Button className="bg-secondary dark:bg-white hover:bg-secondary/90 dark:hover:bg-gray-200 text-white dark:text-black font-bold rounded-xl px-6 shadow-lg hover:shadow-xl transition-all">
                    Lanjut
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Challenges Section (Sidebar style) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-[#1F2937] dark:text-white flex items-center gap-2">
              <span className="bg-[#FFA239] w-2 h-8 rounded-full block"></span>
              Misi Terbaru
            </h2>
          </div>

          <div id="recent-challenges-panel" className="bg-white dark:bg-gray-800 rounded-3xl p-6 border-2 border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="space-y-6">
              {data.recentChallenges.map((challenge, idx) => (
                <div key={challenge.id} className={`relative pl-4 ${idx !== data.recentChallenges.length - 1 ? 'pb-6 border-l-2 border-dashed border-gray-200 dark:border-gray-700' : ''}`}>
                  {/* Status Dot */}
                  <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 shadow-sm 
                    ${challenge.status === 'completed' ? 'bg-[#10B981]' : 
                      challenge.status === 'in-progress' ? 'bg-accent' : 'bg-gray-300 dark:bg-gray-600'}
                  `}></div>

                  <div>
                    <h3 className="font-bold text-[#1F2937] dark:text-white leading-tight">{challenge.title}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-bold bg-accent/10 dark:bg-amber-900/30 text-accent-foreground dark:text-amber-400 px-2 py-1 rounded-md border border-accent/20 dark:border-amber-800">
                        +{challenge.points} XP
                      </span>
                      <span className={`text-xs font-bold px-2 py-1 rounded-md
                         ${challenge.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 
                           challenge.status === 'in-progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}
                      `}>
                        {challenge.status === 'completed' ? 'Selesai' : 
                         challenge.status === 'in-progress' ? 'Sedang Jalan' : 'Baru'}
                      </span>
                    </div>
                    <div className="mt-3">
                      <Link href={`/dashboard/challenges/${challenge.id}`}>
                        <Button size="sm" variant="outline" className="w-full rounded-lg border-gray-200 dark:border-gray-600 font-bold text-gray-600 dark:text-gray-300 hover:text-primary hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10">
                          {challenge.status === 'completed' ? 'Lihat Hasil' : 'Kerjakan'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <Link href="/dashboard/challenges" className="block mt-6">
              <Button className="w-full bg-accent hover:bg-accent/90 text-[#1F2937] font-bold rounded-xl border-b-4 border-accent/80 active:border-b-0 active:translate-y-1 transition-all">
                Cari Misi Lain 🎯
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}