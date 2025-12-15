import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, Plus, Trash2, RefreshCcw, Save } from "lucide-react"
import { importQuestionsFromBank, removeQuestionFromQuiz } from "@/app/actions/admin-quiz-actions"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Client Component for Actions
import { QuizQuestionList } from "./quiz-question-list"
import { ImportQuestionsDialog } from "./import-dialog"
import { QuizSettingsForm } from "./quiz-settings-form"

export default async function EditQuizPage({ params }: { params: Promise<{ courseId: string, sectionId: string, quizId: string }> }) {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'SUPERADMIN') redirect('/dashboard')

  const { courseId, sectionId, quizId } = await params

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        orderBy: { order: 'asc' },
        include: { question: true }
      },
      section: true
    }
  })

  if (!quiz) notFound()

  // Fetch Question Banks for Import
  const questionBanks = await prisma.questionBank.findMany({
    where: { isActive: true },
    include: { _count: { select: { questions: true } } }
  })

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-12 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/dashboard/admin/courses/${courseId}`}>
          <Button variant="outline" size="icon" className="rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
            <h1 className="text-3xl font-black text-[#1F2937] dark:text-white">Edit Kuis</h1>
            <p className="text-gray-500">{quiz.title} (Section: {quiz.section.title})</p>
        </div>
      </div>

      <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
        {/* Left: Quiz Questions */}
        <div className="lg:col-span-2 space-y-6">
            <Card className="border-2 border-gray-100 dark:border-gray-700 shadow-sm rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Daftar Soal ({quiz.questions.length})</CardTitle>
                    <ImportQuestionsDialog quizId={quiz.id} banks={questionBanks} />
                </CardHeader>
                <CardContent>
                    <QuizQuestionList questions={quiz.questions} />
                </CardContent>
            </Card>
        </div>

        {/* Right: Quiz Settings */}
        <div>
            <Card className="border-2 border-gray-100 dark:border-gray-700 shadow-sm rounded-2xl sticky top-24">
                <CardHeader>
                    <CardTitle>Pengaturan Kuis</CardTitle>
                </CardHeader>
                <CardContent>
                    <QuizSettingsForm quiz={quiz} />
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}
