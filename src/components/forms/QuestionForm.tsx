"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Save, X, Plus, Trash2 } from "lucide-react"

interface QuestionFormProps {
  bankId: string
  initialData?: {
    id?: string
    questionText: string
    questionType: string
    options: { [key: string]: string }
    correctAnswer: string
    explanation: string
    points: number
  }
  isEdit?: boolean
}

const questionTypes = [
  { value: "multiple_choice", label: "Pilihan Ganda" },
  { value: "true_false", label: "Benar/Salah" },
  { value: "short_answer", label: "Jawaban Singkat" },
  { value: "coding", label: "Pemrograman" }
]

export default function QuestionForm({ bankId, initialData, isEdit = false }: QuestionFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    questionText: initialData?.questionText || "",
    questionType: initialData?.questionType || "multiple_choice",
    options: initialData?.options || { "A": "", "B": "", "C": "", "D": "" },
    correctAnswer: initialData?.correctAnswer || "A",
    explanation: initialData?.explanation || "",
    points: initialData?.points || 10
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleOptionChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      options: {
        ...prev.options,
        [key]: value
      }
    }))
  }

  const addOption = () => {
    const keys = Object.keys(formData.options)
    const lastKey = keys[keys.length - 1]
    const newKey = String.fromCharCode(lastKey.charCodeAt(0) + 1)
    
    setFormData(prev => ({
      ...prev,
      options: {
        ...prev.options,
        [newKey]: ""
      }
    }))
  }

  const removeOption = (key: string) => {
    const newOptions = { ...formData.options }
    delete newOptions[key]
    
    setFormData(prev => ({
      ...prev,
      options: newOptions,
      correctAnswer: prev.correctAnswer === key ? Object.keys(newOptions)[0] : prev.correctAnswer
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // TODO: Integrate with API
      console.log('Submitting question:', formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Redirect back to question bank detail
      router.push(`/dashboard/admin/question-banks/${bankId}`)
      router.refresh()
    } catch (error) {
      console.error('Error saving question:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Question Type & Points */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipe Soal & Poin</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="questionType" className="block text-sm font-medium text-gray-700 mb-1">
                Tipe Soal *
              </label>
              <select
                id="questionType"
                name="questionType"
                value={formData.questionType}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {questionTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="points" className="block text-sm font-medium text-gray-700 mb-1">
                Poin *
              </label>
              <input
                type="number"
                id="points"
                name="points"
                value={formData.points}
                onChange={handleChange}
                required
                min="1"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Question Text */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pertanyaan</h3>
          
          <div>
            <label htmlFor="questionText" className="block text-sm font-medium text-gray-700 mb-1">
              Teks Pertanyaan *
            </label>
            <textarea
              id="questionText"
              name="questionText"
              value={formData.questionText}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tulis pertanyaan di sini..."
            />
          </div>
        </div>

        {/* Options - Conditionally Rendered */}
        {(formData.questionType === "multiple_choice" || formData.questionType === "true_false") && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Opsi Jawaban</h3>
              {formData.questionType === "multiple_choice" && (
                <Button type="button" variant="outline" size="sm" onClick={addOption}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Opsi
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {Object.entries(formData.options).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-3 flex-1">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="correctAnswer"
                        value={key}
                        checked={formData.correctAnswer === key}
                        onChange={handleChange}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="w-6 text-sm font-medium text-gray-700">{key}.</span>
                    </label>
                    
                    {formData.questionType === "true_false" ? (
                      <input
                        type="text"
                        value={key === "A" ? "Benar" : "Salah"}
                        disabled
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                      />
                    ) : (
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleOptionChange(key, e.target.value)}
                        required
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`Opsi ${key}`}
                      />
                    )}
                  </div>
                  
                  {formData.questionType === "multiple_choice" && Object.keys(formData.options).length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(key)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Correct Answer for Short Answer and Coding */}
        {(formData.questionType === "short_answer" || formData.questionType === "coding") && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Jawaban Benar</h3>
            
            <div>
              <label htmlFor="correctAnswer" className="block text-sm font-medium text-gray-700 mb-1">
                {formData.questionType === "coding" ? "Expected Solution Code" : "Jawaban yang Benar"} *
              </label>
              <textarea
                id="correctAnswer"
                name="correctAnswer"
                value={formData.correctAnswer}
                onChange={handleChange}
                required
                rows={formData.questionType === "coding" ? 6 : 3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder={
                  formData.questionType === "coding" 
                    ? "Tulis kode solusi atau expected output..." 
                    : "Tulis jawaban yang benar..."
                }
              />
            </div>
          </div>
        )}

        {/* Explanation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Penjelasan</h3>
          
          <div>
            <label htmlFor="explanation" className="block text-sm font-medium text-gray-700 mb-1">
              Penjelasan Jawaban
            </label>
            <textarea
              id="explanation"
              name="explanation"
              value={formData.explanation}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Jelaskan mengapa jawaban ini benar dan berikan tips pembelajaran..."
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/dashboard/admin/question-banks/${bankId}`)}
            disabled={loading}
          >
            <X className="h-4 w-4 mr-2" />
            Batal
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Menyimpan...' : isEdit ? 'Update Soal' : 'Simpan Soal'}
          </Button>
        </div>
      </form>
    </div>
  )
}