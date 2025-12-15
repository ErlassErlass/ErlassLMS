import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import QuestionForm from "@/components/forms/QuestionForm"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

interface NewQuestionPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function NewQuestionPage({ params }: NewQuestionPageProps) {
  const session = await getServerSession(authOptions)
  
  if (session?.user.role !== 'SUPERADMIN') {
    redirect('/dashboard')
  }

  const { id } = await params;

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
        
        <h1 className="text-3xl font-bold text-gray-900">Tambah Soal Baru</h1>
        <p className="text-gray-600 mt-2">
          Tambah soal ke bank soal
        </p>
      </div>

      <QuestionForm bankId={id} />
    </div>
  )
}