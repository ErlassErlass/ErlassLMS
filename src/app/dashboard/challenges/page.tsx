import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Play, CheckCircle, Clock, Users } from "lucide-react"

async function getChallenges(userId: string) {
  // Get all published challenges
  const challenges = await prisma.challenge.findMany({
    where: { published: true },
    include: {
      submissions: {
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  })

  // Transform to include user status
  return challenges.map(challenge => {
    const submission = challenge.submissions[0]
    let status: "open" | "submitted" | "completed" = "open"
    
    if (submission) {
      if (submission.passed) status = "completed"
      else status = "submitted"
    }

    return {
      ...challenge,
      status,
      participants: 0 // Placeholder, real count requires another query
    }
  })
}

export default async function ChallengesPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const challenges = await getChallenges(session.user.id)

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-12">
      <div className="mb-8 bg-[#FFF3E0] dark:bg-orange-900/30 p-6 rounded-3xl border border-[#FFA239] dark:border-orange-800">
        <h1 className="text-3xl font-black text-[#1F2937] dark:text-white mb-2">Tantangan Programming 🏆</h1>
        <p className="text-gray-600 dark:text-gray-300 font-medium">
          Temukan dan kerjakan tantangan yang sesuai dengan minat dan level kamu
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges.map((challenge) => (
          <Card key={challenge.id} className="overflow-hidden rounded-2xl border-2 border-gray-100 dark:border-gray-700 dark:bg-gray-800 hover:border-[#FFA239] hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md">
            <CardHeader className="pb-3 bg-gray-50/50 dark:bg-gray-800/50">
              <div className="flex justify-between items-start gap-4">
                <CardTitle className="text-xl font-black text-[#1F2937] dark:text-white leading-tight">
                  {challenge.title}
                </CardTitle>
                <Badge 
                  className={`shrink-0 font-bold rounded-lg px-2.5 py-1
                    ${challenge.status === "open" ? "bg-green-100 text-green-700 hover:bg-green-200 border-green-200" : 
                      challenge.status === "submitted" ? "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200" : 
                      challenge.status === "completed" ? "bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200" : 
                      "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"}
                  `}
                  variant="outline"
                >
                  {challenge.status === "open" && "Terbuka"}
                  {challenge.status === "submitted" && "Terkirim"}
                  {challenge.status === "completed" && "Selesai"}
                </Badge>
              </div>
              <CardDescription className="mt-3 text-gray-500 dark:text-gray-400 font-medium line-clamp-2">
                {challenge.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-sm font-bold text-gray-500 dark:text-gray-400">
                  <Users className="h-4 w-4 mr-1.5 text-[#8CE4FF]" />
                  <span>{challenge.points} XP</span>
                </div>
                <Badge variant="secondary" className="font-bold bg-[#E0F7FA] dark:bg-cyan-900/30 text-[#0088CC] dark:text-cyan-400 hover:bg-[#B2EBF2]">
                  {challenge.category}
                </Badge>
              </div>
              
              <div className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 mb-6 bg-gray-50 dark:bg-gray-700/30 p-3 rounded-xl">
                <Clock className="h-4 w-4 mr-2 text-[#FFA239]" />
                <span>Level: <span className="text-[#1F2937] dark:text-white font-bold">{challenge.difficulty}</span></span>
              </div>
              
              <div className="flex space-x-2">
                {challenge.status === "open" ? (
                  <Link href={`/dashboard/challenges/${challenge.id}`} className="w-full">
                    <Button className="w-full bg-[#1F2937] dark:bg-white hover:bg-black dark:hover:bg-gray-200 text-white dark:text-black font-bold rounded-xl h-11 shadow-md hover:shadow-lg transition-all">
                      <Play className="h-4 w-4 mr-2" />
                      Lihat Misi
                    </Button>
                  </Link>
                ) : challenge.status === "submitted" ? (
                  <Link href={`/dashboard/challenges/${challenge.id}`} className="w-full">
                    <Button variant="outline" className="w-full rounded-xl h-11 font-bold bg-gray-50 border-2">
                      <Clock className="h-4 w-4 mr-2 text-blue-500" />
                      Lihat Status
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/dashboard/challenges/${challenge.id}`} className="w-full">
                    <Button className="w-full rounded-xl h-11 font-bold bg-green-50 text-green-700 border-2 border-green-100 hover:bg-green-100">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Selesai
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}