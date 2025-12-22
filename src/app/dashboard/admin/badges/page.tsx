import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { BadgeDialog } from "@/components/admin/badge-dialog"
import { BadgeActions } from "@/components/admin/badge-actions"
import { Medal, Trophy, Star, Target, Zap, LayoutGrid } from "lucide-react"
import { Badge as PrismaBadge } from "@prisma/client"

export default async function AdminBadgesPage() {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'SUPERADMIN') redirect('/dashboard')

  const badges = await prisma.badge.findMany({ orderBy: { name: 'asc' } })
  const courses = await prisma.course.findMany({ select: { id: true, title: true } })

  const totalXp = badges.reduce((acc, b) => acc + b.xpReward, 0)

  // Helper for Criteria UI
  const getCriteriaIcon = (type: string) => {
    switch(type) {
      case 'XP_MILESTONE': return <Zap className="h-3 w-3" />
      case 'COURSE_COMPLETION': return <Target className="h-3 w-3" />
      case 'CHALLENGE_COUNT': return <CodeIcon className="h-3 w-3" />
      default: return <Star className="h-3 w-3" />
    }
  }

  const getCriteriaLabel = (badge: PrismaBadge) => {
    if (badge.criteriaType === 'MANUAL') return 'Manual Award'
    if (badge.criteriaType === 'XP_MILESTONE') return `${badge.criteriaValue} XP`
    if (badge.criteriaType === 'CHALLENGE_COUNT') return `${badge.criteriaValue} Challenges`
    if (badge.criteriaType === 'COURSE_COMPLETION') return 'Course Completion'
    return badge.criteriaType
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-12 max-w-7xl mx-auto">
      {/* Header Section with Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#1F2937] dark:text-white flex items-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Manajemen Badge
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Atur sistem reward dan pencapaian gamifikasi platform.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="text-center px-2">
               <div className="text-xs text-gray-500 uppercase font-bold">Total Badge</div>
               <div className="text-lg font-black">{badges.length}</div>
            </div>
            <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
            <div className="text-center px-2">
               <div className="text-xs text-gray-500 uppercase font-bold">Total XP Pool</div>
               <div className="text-lg font-black text-blue-600">{totalXp.toLocaleString()}</div>
            </div>
          </div>
          <BadgeDialog courses={courses} />
        </div>
      </div>

      {/* Grid Layout */}
      {badges.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {badges.map((badge) => (
                <div key={badge.id} className="group bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-blue-100 dark:hover:border-blue-900 transition-all duration-300 relative flex flex-col items-center text-center">
                    
                    {/* Absolute Actions - Always visible on touch, hover on desktop */}
                    <div className="absolute top-3 right-3 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <BadgeActions badge={badge} courses={courses} />
                    </div>

                    {/* XP Pill */}
                    {badge.xpReward > 0 && (
                        <div className="absolute top-3 left-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 border border-blue-100 dark:border-blue-800">
                            <Zap className="h-3 w-3" />
                            {badge.xpReward} XP
                        </div>
                    )}

                    {/* Badge Icon (Larger & Centered) */}
                    <div className="mb-4 relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative w-24 h-24 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-5xl shadow-inner border-4 border-white dark:border-gray-600 group-hover:-translate-y-2 transition-transform duration-300">
                            {badge.imageUrl.startsWith('data:image') || badge.imageUrl.startsWith('/') || badge.imageUrl.startsWith('http') ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={badge.imageUrl} alt={badge.name} className="w-full h-full object-cover rounded-full" />
                            ) : (
                                <span>{badge.imageUrl}</span>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="w-full">
                        <h3 className="font-black text-lg text-[#1F2937] dark:text-white mb-1 line-clamp-1" title={badge.name}>{badge.name}</h3>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">{badge.category}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 h-10 line-clamp-2 leading-tight">
                            {badge.description}
                        </p>
                        
                        {/* Criteria Footer */}
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 w-full flex items-center justify-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700">
                            {getCriteriaIcon(badge.criteriaType)}
                            <span className="truncate max-w-[150px]">{getCriteriaLabel(badge)}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-full shadow-sm mb-4">
                <Medal className="h-12 w-12 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Belum Ada Badge</h3>
            <p className="text-gray-500 max-w-md text-center mb-6">Mulai gamifikasi platform dengan membuat badge penghargaan pertama untuk siswa.</p>
            <BadgeDialog courses={courses} />
        </div>
      )}
    </div>
  )
}

function CodeIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
    )
}
