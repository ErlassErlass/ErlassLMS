import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { BadgeDialog } from "@/components/admin/badge-dialog"
import { BadgeActions } from "@/components/admin/badge-actions" // We need to create this small client component for edit/delete actions
import { Medal } from "lucide-react"

export default async function AdminBadgesPage() {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'SUPERADMIN') redirect('/dashboard')

  const badges = await prisma.badge.findMany({ orderBy: { name: 'asc' } })
  const courses = await prisma.course.findMany({ select: { id: true, title: true } })

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#1F2937] dark:text-white">Manajemen Badge</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Atur lencana penghargaan dan kriteria pencapaiannya.</p>
        </div>
        
        <BadgeDialog courses={courses} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {badges.map((badge) => (
            <div key={badge.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-100 dark:border-gray-700 shadow-sm relative">
                <div className="absolute top-4 right-4">
                    <BadgeActions badge={badge} courses={courses} />
                </div>
                <div className="flex items-center gap-4 mb-4">
                    {badge.imageUrl.startsWith('/') ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={badge.imageUrl} alt={badge.name} className="w-12 h-12 object-cover rounded-full border border-gray-200" />
                    ) : (
                        <div className="text-4xl">{badge.imageUrl}</div>
                    )}
                    <div>
                        <h3 className="font-bold text-lg text-[#1F2937] dark:text-white">{badge.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{badge.category}</p>
                    </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">{badge.description}</p>
                
                <div className="flex items-center gap-2 text-xs font-bold bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg text-gray-500">
                    <Medal className="h-3 w-3" />
                    <span>{badge.criteriaType === 'MANUAL' ? 'Manual Award' : `${badge.criteriaType}: ${badge.criteriaValue}`}</span>
                </div>
            </div>
        ))}
      </div>
    </div>
  )
}
