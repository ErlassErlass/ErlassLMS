"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus, X, Trash2, Save, Search } from "lucide-react"

interface QuizFormProps {
  initialData?: {
    id?: string
    title: string
    description: string
    duration: number
    maxAttempts: number
    isActive: boolean
    sectionId?: string
    courseId?: string
    questions: {
      id: string
      questionText: string
      points: number
    }[]
  }
  isEdit?: boolean
}

interface QuestionSelection {
  id: string
  questionText: string
  points: number
  selected: boolean
}

export default function QuizForm({ initialData, isEdit = false }: QuizFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState(initialData?.title || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [duration, setDuration] = useState(initialData?.duration || 30) // in minutes
  const [maxAttempts, setMaxAttempts] = useState(initialData?.maxAttempts || 1)
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true)
  const [questions, setQuestions] = useState(initialData?.questions || [])
  const [searchTerm, setSearchTerm] = useState("")
  const [showQuestionSelector, setShowQuestionSelector] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Prepare the quiz data
      const quizData = {
        title,
        description,
        duration,
        maxAttempts,
        isActive,
        questions: questions.map(q => ({ id: q.id, points: q.points }))
      }

      // TODO: Integrate with API
      console.log('Submitting quiz:', quizData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Redirect back to quizzes list or section
      router.push('/dashboard/admin/quizzes')
      router.refresh()
    } catch (error) {
      console.error('Error saving quiz:', error)
    } finally {
      setLoading(false)
    }
  }

  // Mock function to get available questions based on search term
  const getAvailableQuestions = () => {
    // This would normally come from an API call
    return [
      { id: "1", questionText: "Apa fungsi dari variabel dalam pemrograman?", points: 10 },
      { id: "2", questionText: "Apa perbedaan antara loop for dan while?", points: 15 },
      { id: "3", questionText: "Jelaskan konsep rekursi dalam pemrograman!", points: 20 },
      { id: "4", questionText: "Apa yang dimaksud dengan fungsi rekursif?", points: 15 },
      { id: "5", questionText: "Bagaimana cara kerja stack dalam pemrograman?", points: 25 }
    ].filter(q => 
      q.questionText.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  const addQuestionToQuiz = (question: { id: string; questionText: string; points: number }) => {
    if (!questions.some(q => q.id === question.id)) {
      setQuestions([...questions, { ...question, points: question.points }]) // Default points to question's points
    }
    setShowQuestionSelector(false)
  }

  const removeQuestionFromQuiz = (questionId: string) => {
    setQuestions(questions.filter(q => q.id !== questionId))
  }

  const updateQuestionPoints = (questionId: string, points: number) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, points: Math.max(1, points) } : q
    ))
  }

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Kuis</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Judul Kuis *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Contoh: Ujian Tengah Semester Pemrograman Dasar"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Deskripsi
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Deskripsi singkat tentang kuis ini..."
              />
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pengaturan Kuis</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                Durasi (menit)
              </label>
              <input
                type="number"
                id="duration"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="maxAttempts" className="block text-sm font-medium text-gray-700 mb-1">
                Jumlah Maksimum Percobaan
              </label>
              <input
                type="number"
                id="maxAttempts"
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(Number(e.target.value))}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center">
              <label htmlFor="isActive" className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={() => setIsActive(!isActive)}
                    className="sr-only"
                  />
                  <div className={`block w-14 h-8 rounded-full transition-colors ${
                    isActive ? 'bg-blue-600' : 'bg-gray-300'
                  }`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                    isActive ? 'transform translate-x-6' : ''
                  }`}></div>
                </div>
                <span className="ml-3 text-sm font-medium text-gray-900">
                  {isActive ? 'Aktif' : 'Nonaktif'}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Question Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Pertanyaan dalam Kuis</h3>
            <Button 
              type="button" 
              onClick={() => setShowQuestionSelector(true)}
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Pertanyaan
            </Button>
          </div>
          
          {questions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Belum ada pertanyaan dalam kuis ini</p>
              <p className="mt-2">Klik "Tambah Pertanyaan" untuk menambahkan</p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={question.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{index + 1}. {question.questionText}</div>
                    <div className="text-sm text-gray-500 mt-1">ID: {question.id}</div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div>
                      <label htmlFor={`points-${question.id}`} className="block text-sm text-gray-700 mb-1">
                        Poin
                      </label>
                      <input
                        type="number"
                        id={`points-${question.id}`}
                        value={question.points}
                        onChange={(e) => updateQuestionPoints(question.id, Number(e.target.value))}
                        min="1"
                        className="w-20 px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeQuestionFromQuiz(question.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Question Selector Modal */}
        {showQuestionSelector && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-lg bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Pilih Pertanyaan</h3>
                <button 
                  type="button" 
                  onClick={() => setShowQuestionSelector(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Cari pertanyaan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {getAvailableQuestions().map((question) => {
                  const alreadyAdded = questions.some(q => q.id === question.id)
                  return (
                    <div 
                      key={question.id} 
                      className={`flex items-center justify-between p-3 border rounded-lg mb-2 ${
                        alreadyAdded ? 'bg-gray-100' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="text-sm text-gray-900">{question.questionText}</div>
                        <div className="text-xs text-gray-500">Poin: {question.points}</div>
                      </div>
                      {alreadyAdded ? (
                        <span className="text-sm text-green-600">Sudah ditambahkan</span>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addQuestionToQuiz(question)}
                        >
                          Tambah
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
              
              <div className="mt-4 flex justify-end">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowQuestionSelector(false)}
                >
                  Tutup
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            <X className="h-4 w-4 mr-2" />
            Batal
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Menyimpan...' : isEdit ? 'Update Kuis' : 'Simpan Kuis'}
          </Button>
        </div>
      </form>
    </div>
  )
}