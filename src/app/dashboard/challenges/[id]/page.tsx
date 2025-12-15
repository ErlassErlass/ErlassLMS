
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { notFound } from "next/navigation"
import { 
  Clock, 
  PlayCircle, 
  CheckCircle, 
  Trophy,
  Code,
  Layout,
  BookOpen,
  MessageSquare
} from "lucide-react"
import { ChallengeDiscussion } from "./ChallengeDiscussion"

interface ChallengeDetailPageProps {
  params: Promise<{
    id: string
  }>
}

async function getChallenge(challengeId: string, userId: string) {
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    include: {
        relatedCourse: {
            select: { id: true, title: true, coverImage: true, price: true, isPremium: true }
        }
    }
  })

  if (!challenge) return null

  const submission = await prisma.challengeSubmission.findFirst({
    where: {
      userId,
      challengeId
    },
    orderBy: { createdAt: 'desc' }
  })

  return { challenge, submission }
}

export default async function ChallengeDetailPage({ params }: ChallengeDetailPageProps) {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const { id } = await params
  const data = await getChallenge(id, session.user.id)
  if (!data) notFound()

  const { challenge, submission } = data
  const isCompleted = submission?.passed || false

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-12">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-[#1F2937] dark:bg-gray-900 shadow-xl mb-10">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFA239] rounded-full blur-[100px] opacity-30"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FF5656] rounded-full blur-[100px] opacity-30"></div>
        </div>

        <div className="relative z-10 p-8 md:p-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1 text-white">
              <div className="flex items-center gap-3 mb-4">
                <Badge className="bg-[#FFA239] hover:bg-[#FF8F00] text-white border-none">
                  {challenge.category}
                </Badge>
                <Badge variant="outline" className="text-gray-300 border-gray-600">
                  {challenge.difficulty}
                </Badge>
              </div>

              <h1 className="text-3xl md:text-4xl font-black mb-4 leading-tight">
                {challenge.title}
              </h1>
              
              <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                {challenge.description}
              </p>

              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400 mb-8">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-[#FFA239]" />
                  <span>{challenge.points} XP</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{challenge.timeLimit ? `${challenge.timeLimit} Menit` : 'Tidak ada batas waktu'}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link href={`/dashboard/challenges/${challenge.id}/submit`}>
                  <Button size="lg" className="bg-[#FF5656] hover:bg-[#CC0000] text-white font-bold rounded-xl h-14 px-8 shadow-lg hover:shadow-xl transition-all">
                    <Code className="mr-2 h-5 w-5" />
                    {isCompleted ? 'Kerjakan Lagi' : submission ? 'Lanjutkan' : 'Mulai Coding'}
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Status Card */}
            <div className="w-full md:w-80 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-white">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Layout className="h-5 w-5" /> Status Kamu
              </h3>
              
              {isCompleted ? (
                <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 text-center mb-4">
                  <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-2" />
                  <p className="font-bold text-green-400">Selesai!</p>
                  <p className="text-xs text-green-200/80 mt-1">Kamu sudah menaklukkan tantangan ini.</p>
                </div>
              ) : submission ? (
                <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-4 text-center mb-4">
                  <Clock className="h-12 w-12 text-blue-400 mx-auto mb-2" />
                  <p className="font-bold text-blue-400">Dalam Proses</p>
                  <p className="text-xs text-blue-200/80 mt-1">Ayo selesaikan kodinganmu!</p>
                </div>
              ) : (
                <div className="bg-gray-500/20 border border-gray-500/50 rounded-xl p-4 text-center mb-4">
                  <PlayCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="font-bold text-gray-400">Belum Dimulai</p>
                  <p className="text-xs text-gray-200/80 mt-1">Ambil tantangan ini sekarang.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area (Instructions & Discussion) */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="instructions" className="w-full">
            <TabsList className="w-full bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-100 dark:border-gray-700 h-12 mb-6">
                <TabsTrigger value="instructions" className="flex-1 rounded-lg font-bold data-[state=active]:bg-[#E0F7FA] data-[state=active]:text-[#0088CC]">
                    <BookOpen className="h-4 w-4 mr-2" /> Instruksi
                </TabsTrigger>
                <TabsTrigger value="discussion" className="flex-1 rounded-lg font-bold data-[state=active]:bg-[#FFF3E0] data-[state=active]:text-[#CC7000]">
                    <MessageSquare className="h-4 w-4 mr-2" /> Diskusi & Hints
                </TabsTrigger>
            </TabsList>

            <TabsContent value="instructions" className="mt-0">
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border-2 border-gray-100 dark:border-gray-700 shadow-sm">
                    <h2 className="text-2xl font-black text-[#1F2937] dark:text-white mb-6 flex items-center gap-2">
                    <span className="w-3 h-8 bg-[#8CE4FF] rounded-full block"></span>
                    Instruksi Misi
                    </h2>
                    
                    <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                    <div dangerouslySetInnerHTML={{ __html: challenge.instructions.replace(/\n/g, '<br/>') }} />
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="discussion" className="mt-0">
                {challenge.relatedCourse && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800 rounded-xl flex items-center justify-between shadow-sm">
                        <div className="flex-1">
                            <h4 className="font-bold text-blue-800 dark:text-blue-300 text-sm mb-1">
                                💡 Bingung mengerjakannya?
                            </h4>
                            <p className="text-xs text-blue-600 dark:text-blue-400">
                                Pelajari konsep dasarnya di kursus <span className="font-bold">"{challenge.relatedCourse.title}"</span>.
                            </p>
                        </div>
                        <Link href={`/dashboard/courses/${challenge.relatedCourse.id}`}>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-8 text-xs">
                                Pelajari Materi
                            </Button>
                        </Link>
                    </div>
                )}
                <ChallengeDiscussion challengeId={challenge.id} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Output Preview */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border-2 border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="font-bold text-[#1F2937] dark:text-white mb-4 uppercase tracking-wider text-sm">Expected Output</h3>
            <div className="bg-gray-900 rounded-xl p-4 font-mono text-sm text-green-400 overflow-x-auto">
              {challenge.expectedOutput}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
