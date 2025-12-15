'use client'

import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { removeQuestionFromQuiz } from "@/app/actions/admin-quiz-actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function QuizQuestionList({ questions }: { questions: any[] }) {
    const router = useRouter()

    async function handleRemove(id: string) {
        if(!confirm("Hapus soal ini dari kuis?")) return
        const res = await removeQuestionFromQuiz(id)
        if(res.success) {
            toast.success("Soal dihapus")
            router.refresh()
        } else {
            toast.error("Gagal menghapus soal")
        }
    }

    if(questions.length === 0) {
        return <div className="text-center py-8 text-gray-500 italic">Belum ada soal. Silakan impor dari Bank Soal.</div>
    }

    return (
        <div className="space-y-3">
            {questions.map((q, idx) => (
                <div key={q.id} className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-transparent hover:border-gray-200 transition-all group">
                    <div className="bg-white dark:bg-gray-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border">
                        {idx + 1}
                    </div>
                    <div className="flex-1">
                        <p className="font-medium text-sm text-[#1F2937] dark:text-white line-clamp-2">{q.question.questionText}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                            <span className="uppercase bg-gray-200 dark:bg-gray-600 px-1.5 py-0.5 rounded">{q.question.questionType}</span>
                            <span>{q.question.points || 10} Poin</span>
                        </div>
                    </div>
                    <Button 
                        size="icon" 
                        variant="ghost" 
                        className="text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemove(q.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ))}
        </div>
    )
}
