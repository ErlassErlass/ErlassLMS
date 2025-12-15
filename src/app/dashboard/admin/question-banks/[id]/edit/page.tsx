import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { getQuestionBank } from "@/lib/question-service"
import QuestionBankForm from "@/components/forms/QuestionBankForm"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

interface EditQuestionBankPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditQuestionBankPage({ params }: EditQuestionBankPageProps) {
  const session = await getServerSession(authOptions)
  
  if (session?.user.role !== 'SUPERADMIN') {
    redirect('/dashboard')
  }

  const { id } = await params;

  // Fetch question bank data by ID
  let questionBank = null;
  try {
    questionBank = await getQuestionBank(id);
  } catch (error) {
    console.error("Error fetching question bank:", error);
    redirect('/dashboard/admin/question-banks')
  }

  if (!questionBank) {
    notFound()
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Navigation */}
      <div className="mb-6">
        <Link 
          href="/dashboard/admin/question-banks"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Kembali ke Bank Soal
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900">Edit Bank Soal</h1>
        <p className="text-gray-600 mt-2">
          Ubah informasi bank soal
        </p>
      </div>

      <QuestionBankForm initialData={questionBank as any} isEdit />
    </div>
  )
}