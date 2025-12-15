'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, ArrowRight, RefreshCcw, Award, PlayCircle, HelpCircle, Mic } from "lucide-react"
import { submitQuiz } from "@/app/actions/quiz-actions"
import { toast } from "sonner"
import confetti from "canvas-confetti"
import { useRouter } from "next/navigation"

interface QuizRunnerProps {
  quiz: any
  userId: string
}

export default function QuizRunner({ quiz, userId }: QuizRunnerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const router = useRouter()

  const questions = quiz.questions
  const currentQuestion = questions[currentQuestionIndex].question
  const isLastQuestion = currentQuestionIndex === questions.length - 1

  const handleOptionSelect = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }))
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const res = await submitQuiz(quiz.id, answers)
      if (res.success) {
        setResult(res)
        if (res.isPassed) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          })
          // toast.success(`Selamat! Kamu lulus dengan nilai ${Math.round(res.score)}`)
        } else {
          // toast.error(`Yah, nilaimu ${Math.round(res.score)}. Coba lagi ya!`)
        }
        router.refresh()
      } else {
        // toast.error(res.message)
      }
    } catch (error) {
      console.error(error)
      // toast.error("Gagal mengirim jawaban")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRetry = () => {
    setAnswers({})
    setResult(null)
    setCurrentQuestionIndex(0)
  }

  // Result View
  if (result) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border-2 border-gray-100 dark:border-gray-700 text-center">
        <div className="mb-6 flex justify-center">
          {result.isPassed ? (
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 animate-bounce">
              <Award className="h-12 w-12" />
            </div>
          ) : (
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center text-red-600">
              <XCircle className="h-12 w-12" />
            </div>
          )}
        </div>

        <h2 className="text-3xl font-black text-[#1F2937] dark:text-white mb-2">
          {result.isPassed ? "Hore! Lulus!" : "Belum Lulus"}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Kamu mendapatkan nilai <span className="font-bold text-2xl text-[#FF5656]">{Math.round(result.score)}</span>
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
            <p className="text-sm text-gray-500">Benar</p>
            <p className="text-2xl font-bold text-green-600">{result.correctCount}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
            <p className="text-sm text-gray-500">Salah</p>
            <p className="text-2xl font-bold text-red-600">{result.totalQuestions - result.correctCount}</p>
          </div>
        </div>

        {result.xpAwarded > 0 && (
            <div className="mb-8 inline-block bg-[#FFF3E0] text-[#CC7000] px-6 py-2 rounded-full font-bold border border-[#FFA239]">
                +{result.xpAwarded} XP Didapatkan!
            </div>
        )}

        <div className="flex justify-center gap-4">
          {!result.isPassed && (
            <Button onClick={handleRetry} variant="outline" className="rounded-xl h-12 px-6 font-bold">
              <RefreshCcw className="mr-2 h-4 w-4" /> Coba Lagi
            </Button>
          )}
          {/* If passed, maybe show next section button or back to course */}
          {result.isPassed && (
            <Button className="bg-[#FF5656] hover:bg-[#CC0000] text-white rounded-xl h-12 px-6 font-bold">
               Selesai
            </Button>
          )}
        </div>
      </div>
    )
  }

  // Quiz View
  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border-2 border-gray-100 dark:border-gray-700 shadow-sm">
      {/* Header */}
      <div className="bg-[#FDFDFD] dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <HelpCircle className="h-5 w-5" />
            </div>
            <div>
                <h3 className="font-bold text-[#1F2937] dark:text-white">{quiz.title}</h3>
                <p className="text-xs text-gray-500">Soal {currentQuestionIndex + 1} dari {questions.length}</p>
            </div>
        </div>
        <div className="text-right">
            <span className="font-black text-xl text-[#FF5656]">{currentQuestion.points}</span>
            <span className="text-xs text-gray-400 font-bold ml-1">Pts</span>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {/* Media Display */}
        {currentQuestion.mediaUrl && (
            <div className="mb-6 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                {currentQuestion.mediaType === 'IMAGE' && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={currentQuestion.mediaUrl} alt="Question Media" className="max-h-80 w-full object-contain bg-black/5" />
                )}
                {currentQuestion.mediaType === 'VIDEO' && (
                    <div className="aspect-video bg-black">
                        <iframe src={currentQuestion.mediaUrl.replace('watch?v=', 'embed/')} className="w-full h-full" allowFullScreen />
                    </div>
                )}
                {currentQuestion.mediaType === 'AUDIO' && (
                    <div className="p-6 bg-gray-50 flex items-center gap-4 justify-center">
                        <div className="p-3 bg-white rounded-full shadow-sm">
                            <Mic className="h-6 w-6 text-[#FF5656]" />
                        </div>
                        <audio controls src={currentQuestion.mediaUrl} className="w-full max-w-md" />
                    </div>
                )}
            </div>
        )}

        <h4 className="text-xl font-bold text-[#1F2937] dark:text-white mb-6 leading-relaxed">
          {currentQuestion.questionText}
        </h4>

        <RadioGroup 
            value={answers[currentQuestion.id] || ""} 
            onValueChange={handleOptionSelect}
            className="space-y-3"
        >
            {currentQuestion.options && Array.isArray(currentQuestion.options) && currentQuestion.options.map((opt: any) => (
                <div key={opt.id} className={`flex items-center space-x-3 border-2 rounded-xl p-4 cursor-pointer transition-all ${answers[currentQuestion.id] === opt.id ? 'border-[#0088CC] bg-[#E0F7FA] dark:bg-cyan-900/20' : 'border-gray-100 dark:border-gray-700 hover:border-gray-300'}`}>
                    <RadioGroupItem value={opt.id} id={`opt-${opt.id}`} />
                    <Label htmlFor={`opt-${opt.id}`} className="flex-1 cursor-pointer font-medium text-gray-700 dark:text-gray-300">
                        {opt.text}
                    </Label>
                </div>
            ))}
        </RadioGroup>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800/50 p-6 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
        <Button 
            variant="ghost" 
            onClick={handlePrev} 
            disabled={currentQuestionIndex === 0}
            className="text-gray-500 hover:text-[#1F2937]"
        >
            Sebelumnya
        </Button>

        <div className="flex gap-2">
            {questions.map((_: any, idx: number) => (
                <div key={idx} className={`h-2 w-2 rounded-full ${idx === currentQuestionIndex ? 'bg-[#FF5656]' : 'bg-gray-300 dark:bg-gray-600'}`} />
            ))}
        </div>

        {isLastQuestion ? (
            <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting || !answers[currentQuestion.id]}
                className="bg-[#FF5656] hover:bg-[#CC0000] text-white font-bold rounded-xl px-8"
            >
                {isSubmitting ? "Mengirim..." : "Selesai"}
            </Button>
        ) : (
            <Button 
                onClick={handleNext} 
                disabled={!answers[currentQuestion.id]}
                className="bg-[#1F2937] hover:bg-black text-white font-bold rounded-xl px-6"
            >
                Lanjut <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        )}
      </div>
    </div>
  )
}
