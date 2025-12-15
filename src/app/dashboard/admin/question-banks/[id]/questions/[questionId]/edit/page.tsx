import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { getQuestion } from "@/lib/question-service"
import QuestionForm from "@/components/forms/QuestionForm"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

interface EditQuestionPageProps {
  params: Promise<{
    id: string,        // question bank id
    questionId: string // question id
  }>
}

export default async function EditQuestionPage({ params }: EditQuestionPageProps) {
  const session = await getServerSession(authOptions)
  
  if (session?.user.role !== 'SUPERADMIN') {
    redirect('/dashboard')
  }

  const { id, questionId } = await params;

  // Get the question data
  let question = null;
  try {
    question = await getQuestion(questionId);
  } catch (error) {
    console.error("Error fetching question:", error);
    notFound()
  }

  if (!question) {
    notFound()
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Navigation */}
      <div className="mb-6">
        <Link 
          href={`/dashboard/admin/question-banks/${id}`}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Kembali ke Bank Soal
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900">Edit Soal</h1>
        <p className="text-gray-600 mt-2">
          Edit soal dalam bank: {id}
        </p>
      </div>

      <QuestionForm 
        bankId={id} 
        initialData={question as any} 
        isEdit={true} 
      />
    </div>
  )
}