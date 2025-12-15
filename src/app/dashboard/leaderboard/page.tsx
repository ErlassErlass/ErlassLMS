
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Trophy, Medal, Crown, Star } from "lucide-react"

async function getLeaderboard() {
  const users = await prisma.user.findMany({
    take: 10,
    orderBy: { xp: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      xp: true,
      level: true,
      role: true
    }
  })

  return users
}

export default async function LeaderboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const leaderboard = await getLeaderboard()

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-12">
      <div className="mb-8 bg-[#FFFDE7] dark:bg-yellow-900/30 p-6 rounded-3xl border border-[#FEEE91] dark:border-yellow-800">
        <h1 className="text-3xl font-black text-[#1F2937] dark:text-white mb-2">Papan Peringkat 🏆</h1>
        <p className="text-gray-600 dark:text-gray-300 font-medium">
          Lihat siapa yang paling rajin ngoding minggu ini!
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border-2 border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-[#1F2937] dark:text-white">Top 10 Coders</h2>
        </div>
        
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {leaderboard.map((user, index) => {
            const isCurrentUser = user.id === session.user.id
            return (
              <div 
                key={user.id} 
                className={`
                  flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors
                  ${isCurrentUser ? 'bg-[#E0F7FA] dark:bg-cyan-900/20' : ''}
                `}
              >
                <div className="flex items-center gap-4">
                  <div className={`
                    w-10 h-10 flex items-center justify-center rounded-full font-bold text-lg
                    ${index === 0 ? 'bg-[#FFD700] text-yellow-800' : 
                      index === 1 ? 'bg-[#C0C0C0] text-gray-800' : 
                      index === 2 ? 'bg-[#CD7F32] text-orange-900' : 
                      'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}
                  `}>
                    {index < 3 ? <Crown className="h-5 w-5" /> : index + 1}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-tertiary rounded-full flex items-center justify-center text-white font-bold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-[#1F2937] dark:text-white flex items-center gap-2">
                        {user.name}
                        {isCurrentUser && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Kamu</span>}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Level {user.level} • {user.role === 'SUPERADMIN' ? 'Master' : 'Student'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-black text-xl text-[#FF5656] dark:text-red-400">{user.xp}</span>
                  <span className="text-xs font-bold text-gray-400">XP</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
