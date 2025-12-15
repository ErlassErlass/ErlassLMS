
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { GamificationService } from "@/lib/services/gamification-service"
import { User, Award, Zap, Calendar, BookOpen, Code, FileText, Download } from "lucide-react"
import { getUserCertificates } from "@/app/actions/certificate-actions"

async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      badges: {
        include: {
          badge: true
        }
      },
      enrollments: {
        where: { status: 'COMPLETED' },
        include: { course: true }
      },
      submissions: {
        where: { passed: true },
        include: { challenge: true }
      }
    }
  })

  // Fetch Active Inventory Items (Frame & Title)
  // Using Raw Query because of potential client mismatch
  const activeItems: any[] = await prisma.$queryRaw`
    SELECT s."type", s."assetUrl" 
    FROM user_inventory ui
    JOIN shop_items s ON ui."shopItemId" = s.id
    WHERE ui."userId" = ${userId} AND ui."isActive" = true
  `

  const activeFrame = activeItems.find(i => i.type === 'FRAME')?.assetUrl
  const activeTitle = activeItems.find(i => i.type === 'TITLE')?.assetUrl

  return { ...user, activeFrame, activeTitle }
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const user = await getUserProfile(session.user.id)
  if (!user) return null

  const certResult = await getUserCertificates(session.user.id)
  const certificates = certResult.success ? certResult.data : []

  const levelProgress = GamificationService.calculateLevelProgress(user.xp || 0)

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-12">
      {/* Header Profile */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-[#1F2937] dark:bg-gray-900 shadow-xl">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-secondary rounded-full blur-[100px] opacity-30"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent rounded-full blur-[100px] opacity-30"></div>
        </div>

        <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
             <div className={`w-32 h-32 rounded-full bg-primary flex items-center justify-center shadow-2xl border-4 border-white/10 overflow-hidden ${user.activeFrame || ''}`}>
                <span className="text-5xl font-black text-white">
                {user.name?.charAt(0).toUpperCase()}
                </span>
             </div>
             {user.activeFrame && <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm border border-white">FRAME</div>}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2 flex items-center justify-center md:justify-start gap-3">
                {user.name}
                {user.activeTitle && (
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg animate-pulse">
                        {user.activeTitle}
                    </Badge>
                )}
            </h1>
            <p className="text-gray-400 text-lg mb-4">{user.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <Badge className="bg-[#FF5656] hover:bg-[#CC0000] text-white border-none text-sm py-1 px-3">
                Level {user.level}
              </Badge>
              <Badge variant="outline" className="border-gray-600 text-gray-300 text-sm py-1 px-3">
                {user.role}
              </Badge>
            </div>
          </div>

          <div className="w-full md:w-80 bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <div className="flex justify-between text-sm font-bold text-gray-300 mb-2">
              <span>Level {user.level || 1}</span>
              <span>{levelProgress.currentLevelXp} / {levelProgress.nextLevelXp - (Math.pow((user.level || 1) - 1, 2) * 100)} XP</span>
            </div>
            <Progress value={levelProgress.percent} className="h-3 bg-gray-700" indicatorClassName="bg-primary" />
            <p className="text-xs text-center text-gray-500 mt-3">
              Butuh {levelProgress.nextLevelXp - (user.xp || 0)} XP lagi untuk naik level!
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Stats & Badges */}
        <div className="lg:col-span-2 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border-2 border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[#E0F7FA] dark:bg-cyan-900/30 rounded-lg text-[#0088CC] dark:text-cyan-400">
                  <Zap className="h-5 w-5" />
                </div>
                <span className="text-sm font-bold text-gray-500 dark:text-gray-400">Total XP</span>
              </div>
              <p className="text-2xl font-black text-[#1F2937] dark:text-white">{user.xp}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border-2 border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[#FFF3E0] dark:bg-orange-900/30 rounded-lg text-[#CC7000] dark:text-orange-400">
                  <Award className="h-5 w-5" />
                </div>
                <span className="text-sm font-bold text-gray-500 dark:text-gray-400">Badges</span>
              </div>
              <p className="text-2xl font-black text-[#1F2937] dark:text-white">{user.badges?.length || 0}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border-2 border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[#F3E5F5] dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                  <BookOpen className="h-5 w-5" />
                </div>
                <span className="text-sm font-bold text-gray-500 dark:text-gray-400">Kursus</span>
              </div>
              <p className="text-2xl font-black text-[#1F2937] dark:text-white">{user.enrollments?.length || 0}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border-2 border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[#E8F5E9] dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                  <Code className="h-5 w-5" />
                </div>
                <span className="text-sm font-bold text-gray-500 dark:text-gray-400">Tantangan</span>
              </div>
              <p className="text-2xl font-black text-[#1F2937] dark:text-white">{user.submissions?.length || 0}</p>
            </div>
          </div>

          {/* Badges Collection */}
          <div id="badges" className="bg-white dark:bg-gray-800 rounded-3xl p-8 border-2 border-gray-100 dark:border-gray-700 shadow-sm scroll-mt-24">
            <h2 className="text-xl font-black text-[#1F2937] dark:text-white mb-6 flex items-center gap-2">
              <Award className="h-6 w-6 text-[#FFA239]" />
              Koleksi Badge
            </h2>
            
            {user.badges && user.badges.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {user.badges.map(({ badge }: any) => (
                  <div key={badge.id} className="flex flex-col items-center text-center group">
                    <div className="w-20 h-20 bg-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center text-4xl shadow-inner mb-3 border-2 border-gray-200 dark:border-gray-600 group-hover:scale-110 transition-transform duration-300">
                      {badge.imageUrl}
                    </div>
                    <h3 className="font-bold text-sm text-[#1F2937] dark:text-white mb-1">{badge.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{badge.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                <Award className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">Belum ada badge yang didapatkan.</p>
                <p className="text-sm text-gray-400 mt-1">Selesaikan kursus atau tantangan untuk dapat badge!</p>
              </div>
            )}
          </div>

          {/* Certificates Section */}
          <div id="certificates" className="bg-white dark:bg-gray-800 rounded-3xl p-8 border-2 border-gray-100 dark:border-gray-700 shadow-sm scroll-mt-24">
            <h2 className="text-xl font-black text-[#1F2937] dark:text-white mb-6 flex items-center gap-2">
              <FileText className="h-6 w-6 text-[#41A67E]" />
              Sertifikat Saya
            </h2>
            
            {certificates && certificates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certificates.map((cert) => (
                  <div key={cert.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 hover:border-[#41A67E] transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-[#E0F7FA] dark:bg-green-900/30 flex items-center justify-center text-[#41A67E]">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[#1F2937] dark:text-white line-clamp-1 text-sm">
                          {cert.course?.title || cert.challenge?.title || "Achievement"}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(cert.issuedAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    
                    <a 
                      href={`/api/certificates/${cert.serialNumber}/download`} 
                      target="_blank"
                      className="p-2 text-gray-400 hover:text-[#41A67E] hover:bg-white dark:hover:bg-gray-800 rounded-full transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                      title="Download PDF"
                    >
                      <Download className="h-5 w-5" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">Belum ada sertifikat.</p>
                <p className="text-sm text-gray-400 mt-1">Selesaikan kursus untuk mendapatkan sertifikat!</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity / History */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border-2 border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="font-bold text-[#1F2937] dark:text-white mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Aktivitas Terbaru
            </h3>
            <div className="space-y-4">
              {user.submissions?.slice(0, 5).map((sub: any) => (
                <div key={sub.id} className="flex items-start gap-3 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0">
                  <div className="mt-1 p-1.5 bg-[#E0F7FA] dark:bg-cyan-900/30 rounded-lg text-[#0088CC] dark:text-cyan-400">
                    <Code className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1F2937] dark:text-white line-clamp-1">
                      Menyelesaikan {sub.challenge.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {new Date(sub.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
              
              {user.enrollments?.slice(0, 3).map((enroll: any) => (
                <div key={enroll.id} className="flex items-start gap-3 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0">
                  <div className="mt-1 p-1.5 bg-[#FFF3E0] dark:bg-orange-900/30 rounded-lg text-[#CC7000] dark:text-orange-400">
                    <Award className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1F2937] dark:text-white line-clamp-1">
                      Lulus kursus {enroll.course.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {enroll.completedAt ? new Date(enroll.completedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Baru saja'}
                    </p>
                  </div>
                </div>
              ))}

              {(!user.submissions || user.submissions.length === 0) && (!user.enrollments || user.enrollments.length === 0) && (
                <p className="text-sm text-gray-500 text-center py-4">Belum ada aktivitas.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
