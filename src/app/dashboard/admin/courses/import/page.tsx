
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Upload, FileJson, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { importCourses } from "@/app/actions/bulk-import-actions"

export default async function ImportCoursesPage() {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'SUPERADMIN') redirect('/dashboard')

  async function handleImport(formData: FormData) {
    'use server'
    const jsonContent = formData.get('jsonContent') as string
    const result = await importCourses(jsonContent)
    if (result.success) {
        redirect('/dashboard/admin/courses')
    }
    // In a real app, we would handle error display state here
  }

  const exampleJson = `[
  {
    "title": "Python untuk Data Science",
    "description": "Belajar analisis data dengan Pandas dan NumPy",
    "category": "python",
    "level": "Intermediate",
    "price": 150000,
    "sections": [
      {
        "title": "Pengenalan Pandas",
        "content": "Pandas adalah library...",
        "videoUrl": "https://youtu.be/..."
      },
      {
        "title": "Visualisasi Data",
        "content": "Menggunakan Matplotlib...",
        "videoUrl": "https://youtu.be/..."
      }
    ]
  }
]`

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-12 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/admin/courses">
          <Button variant="outline" size="icon" className="rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
            <h1 className="text-2xl font-black text-[#1F2937] dark:text-white">Import Kursus (Bulk)</h1>
            <p className="text-gray-500">Tambahkan banyak kursus sekaligus menggunakan JSON.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <form action={handleImport} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border-2 border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="mb-4">
                    <label htmlFor="jsonContent" className="block font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Paste JSON Data
                    </label>
                    <textarea 
                        id="jsonContent" 
                        name="jsonContent" 
                        rows={15}
                        className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 font-mono text-sm focus:border-[#FF5656] focus:ring-0"
                        placeholder={exampleJson}
                        required
                    ></textarea>
                </div>
                <Button type="submit" className="w-full bg-[#FF5656] hover:bg-[#CC0000] text-white font-bold py-6 rounded-xl">
                    <Upload className="mr-2 h-5 w-5" />
                    Import Kursus Sekarang
                </Button>
            </form>
        </div>

        <div className="space-y-6">
            <div className="bg-[#E0F7FA] dark:bg-cyan-900/20 p-6 rounded-3xl border-2 border-[#8CE4FF] dark:border-cyan-800">
                <h3 className="font-bold text-[#0088CC] dark:text-cyan-400 mb-3 flex items-center gap-2">
                    <FileJson className="h-5 w-5" />
                    Format JSON
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Pastikan format JSON Anda valid. Gunakan struktur array <code>[]</code> yang berisi object kursus.
                </p>
                <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-2 list-disc list-inside">
                    <li>Category: scratch, python, javascript, web</li>
                    <li>Level: Beginner, Intermediate, Advanced</li>
                    <li>Sections bersifat opsional</li>
                    <li>Price 0 = Gratis</li>
                </ul>
            </div>

            <div className="bg-[#FFF3E0] dark:bg-orange-900/20 p-6 rounded-3xl border-2 border-[#FFA239] dark:border-orange-800">
                <h3 className="font-bold text-[#CC7000] dark:text-orange-400 mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Perhatian
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    Proses ini akan membuat kursus baru. Jika ada kesalahan format, seluruh proses akan dibatalkan.
                </p>
            </div>
        </div>
      </div>
    </div>
  )
}
