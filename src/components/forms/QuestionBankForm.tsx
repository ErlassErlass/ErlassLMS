"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Save, X } from "lucide-react"

interface QuestionBankFormProps {
  initialData?: {
    id?: string
    title: string
    description: string
    category: string
    difficulty: string
    isActive: boolean
  }
  isEdit?: boolean
}

const categories = [
  { value: "scratch", label: "Scratch", color: "bg-blue-100 text-blue-800" },
  { value: "pictoblox", label: "Pictoblox", color: "bg-green-100 text-green-800" },
  { value: "microbit", label: "Microbit", color: "bg-purple-100 text-purple-800" },
  { value: "python", label: "Python", color: "bg-orange-100 text-orange-800" },
  { value: "javascript", label: "JavaScript", color: "bg-yellow-100 text-yellow-800" }
]

const difficulties = [
  { value: "easy", label: "Mudah", color: "bg-green-100 text-green-800" },
  { value: "medium", label: "Menengah", color: "bg-yellow-100 text-yellow-800" },
  { value: "hard", label: "Sulit", color: "bg-red-100 text-red-800" }
]

export default function QuestionBankForm({ initialData, isEdit = false }: QuestionBankFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    category: initialData?.category || "scratch",
    difficulty: initialData?.difficulty || "easy",
    isActive: initialData?.isActive ?? true
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // TODO: Integrate with API
      console.log('Submitting question bank:', formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Redirect back to question banks list
      router.push('/dashboard/admin/question-banks')
      router.refresh()
    } catch (error) {
      console.error('Error saving question bank:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Dasar</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Judul Bank Soal *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Contoh: Scratch Dasar - Variabel dan Loop"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Deskripsi
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Deskripsi singkat tentang bank soal ini..."
              />
            </div>
          </div>
        </div>

        {/* Category & Difficulty */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Klasifikasi</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Kategori *
              </label>
              <div className="space-y-2">
                {categories.map((category) => (
                  <label key={category.value} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      value={category.value}
                      checked={formData.category === category.value}
                      onChange={handleChange}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${category.color}`}>
                      {category.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tingkat Kesulitan *
              </label>
              <div className="space-y-2">
                {difficulties.map((difficulty) => (
                  <label key={difficulty.value} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="difficulty"
                      value={difficulty.value}
                      checked={formData.difficulty === difficulty.value}
                      onChange={handleChange}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${difficulty.color}`}>
                      {difficulty.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Status Bank Soal</h3>
              <p className="text-sm text-gray-600 mt-1">
                Bank soal aktif dapat digunakan dalam kuis dan assessment
              </p>
            </div>
            <div className="flex items-center">
              <label htmlFor="isActive" className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`block w-14 h-8 rounded-full transition-colors ${
                    formData.isActive ? 'bg-blue-600' : 'bg-gray-300'
                  }`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                    formData.isActive ? 'transform translate-x-6' : ''
                  }`}></div>
                </div>
                <span className="ml-3 text-sm font-medium text-gray-900">
                  {formData.isActive ? 'Aktif' : 'Nonaktif'}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/admin/question-banks')}
            disabled={loading}
          >
            <X className="h-4 w-4 mr-2" />
            Batal
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Menyimpan...' : isEdit ? 'Update Bank Soal' : 'Simpan Bank Soal'}
          </Button>
        </div>
      </form>
    </div>
  )
}