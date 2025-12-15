// components/quiz/QuizComponent.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { QuizService } from "@/lib/services/quiz-service"
import { ProgressService } from "@/lib/services/progress-service"
import { Clock, CheckCircle, AlertCircle } from "lucide-react"

interface QuizComponentProps {
  quiz: any
  sectionId: string
  courseId: string
  userId: string
}

export default function QuizComponent({ quiz, sectionId, courseId, userId }: QuizComponentProps) {
  const router = useRouter()
  const [currentAttempt, setCurrentAttempt] = useState<any>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState<number>(quiz.duration ? quiz.duration * 60 : 0)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (quiz.duration && timeLeft > 0 && !submitted) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    } else if (timeLeft === 0 && !submitted) {
      handleSubmit()
    }
  }, [timeLeft, submitted])

  const startQuiz = async () => {
    try {
      const attempt = await QuizService.startQuizAttempt(quiz.id, userId)
      setCurrentAttempt(attempt)
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleSubmit = async () => {
    if (loading) return

    setLoading(true)
    try {
      const timeSpent = quiz.duration ? (quiz.duration * 60 - timeLeft) : 0
      const result = await QuizService.submitQuizAttempt(currentAttempt.id, answers, timeSpent)
      
      // Update progress jika quiz passed (misal: minimal score 80%)
      if (result.score && result.score >= 80) {
        await ProgressService.completeSection(userId, sectionId, courseId, result.score)
      }

      setSubmitted(true)
      router.refresh()
    } catch (error) {
      console.error('Error submitting quiz:', error)
      alert('Error submitting quiz')
    } finally {
      setLoading(false)
    }
  }

  // Jika belum mulai quiz
  if (!currentAttempt) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Kuis Section</h3>
          <p className="text-gray-600 mb-6">
            Uji pemahaman Anda dengan kuis ini. Anda perlu mendapatkan nilai minimal 80% untuk melanjutkan.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-2xl font-bold text-erlass-primary mb-1">
                {quiz.questions.length}
              </div>
              <div className="text-sm text-gray-600">Pertanyaan</div>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-2xl font-bold text-erlass-primary mb-1">
                {quiz.duration || '∞'}
              </div>
              <div className="text-sm text-gray-600">Menit</div>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-2xl font-bold text-erlass-primary mb-1">
                {quiz.maxAttempts}
              </div>
              <div className="text-sm text-gray-600">Percobaan</div>
            </div>
          </div>

          <Button onClick={startQuiz} size="lg">
            Mulai Kuis
          </Button>
        </div>
      </div>
    )
  }

  // Jika sudah submit
  if (submitted) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Kuis Selesai!</h3>
          <p className="text-gray-600 mb-4">
            Terima kasih telah menyelesaikan kuis.
          </p>
          <Button onClick={() => router.refresh()}>
            Lanjutkan Belajar
          </Button>
        </div>
      </div>
    )
  }

  // Sedang mengerjakan quiz
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Quiz Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">{quiz.title}</h3>
          {quiz.duration && (
            <div className="flex items-center space-x-2 bg-erlass-primary/10 px-3 py-1 rounded-full">
              <Clock className="h-4 w-4 text-erlass-primary" />
              <span className="text-sm font-medium text-erlass-primary">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
          )}
        </div>
        <p className="text-gray-600 mt-1">{quiz.description}</p>
      </div>

      {/* Quiz Questions */}
      <div className="p-6 space-y-8">
        {quiz.questions.map((quizQuestion: any, index: number) => (
          <div key={quizQuestion.id} className="border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              {index + 1}. {quizQuestion.question.questionText}
            </h4>

            <div className="space-y-3">
              {quizQuestion.question.questionType === 'multiple_choice' && (
                quizQuestion.question.options.map((option: any) => (
                  <label key={option.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name={`question-${quizQuestion.question.id}`}
                      value={option.id}
                      checked={answers[quizQuestion.question.id] === option.id}
                      onChange={() => handleAnswerSelect(quizQuestion.question.id, option.id)}
                      className="text-erlass-primary focus:ring-erlass-primary"
                    />
                    <span className="flex-1">{option.optionText}</span>
                  </label>
                ))
              )}

              {quizQuestion.question.questionType === 'true_false' && (
                quizQuestion.question.options.map((option: any) => (
                  <label key={option.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name={`question-${quizQuestion.question.id}`}
                      value={option.id}
                      checked={answers[quizQuestion.question.id] === option.id}
                      onChange={() => handleAnswerSelect(quizQuestion.question.id, option.id)}
                      className="text-erlass-primary focus:ring-erlass-primary"
                    />
                    <span className="flex-1">{option.optionText}</span>
                  </label>
                ))
              )}

              {quizQuestion.question.questionType === 'short_answer' && (
                <input
                  type="text"
                  value={answers[quizQuestion.question.id] || ''}
                  onChange={(e) => handleAnswerSelect(quizQuestion.question.id, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-erlass-primary focus:border-transparent"
                  placeholder="Tulis jawaban Anda..."
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quiz Footer */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {Object.keys(answers).length} dari {quiz.questions.length} pertanyaan terjawab
          </div>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || Object.keys(answers).length !== quiz.questions.length}
          >
            {loading ? 'Mengirim...' : 'Selesai & Lihat Hasil'}
          </Button>
        </div>
      </div>
    </div>
  )
}