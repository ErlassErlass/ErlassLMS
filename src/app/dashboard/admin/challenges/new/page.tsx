
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { createChallenge } from "@/app/actions/admin-challenge-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default async function NewChallengePage() {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'SUPERADMIN') redirect('/dashboard')

  async function handleCreate(formData: FormData) {
    'use server'
    await createChallenge(formData)
    redirect('/dashboard/admin/challenges')
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-12 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/admin/challenges">
          <Button variant="outline" size="icon" className="rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-black text-[#1F2937] dark:text-white">Buat Tantangan Baru</h1>
      </div>

      <form action={handleCreate} className="space-y-8">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border-2 border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="title">Judul Tantangan</Label>
                    <Input id="title" name="title" placeholder="Contoh: Fibonacci Sequence" required className="rounded-xl" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="category">Kategori</Label>
                    <select id="category" name="category" className="w-full p-2 rounded-xl border bg-background h-10">
                        <option value="python">Python</option>
                        <option value="javascript">JavaScript</option>
                        <option value="web">Web (HTML/CSS)</option>
                        <option value="scratch">Scratch</option>
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Deskripsi Singkat</Label>
                <Input id="description" name="description" placeholder="Penjelasan singkat tentang tantangan..." required className="rounded-xl" />
            </div>

            <div className="space-y-2">
                <Label htmlFor="instructions">Instruksi Lengkap (HTML Supported)</Label>
                <Textarea id="instructions" name="instructions" placeholder="Langkah-langkah pengerjaan..." className="rounded-xl h-40 font-mono text-sm" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="difficulty">Tingkat Kesulitan</Label>
                    <select id="difficulty" name="difficulty" className="w-full p-2 rounded-xl border bg-background h-10">
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="points">XP Reward</Label>
                    <Input type="number" id="points" name="points" defaultValue="50" className="rounded-xl" />
                </div>
                <div className="space-y-2 flex flex-col justify-end pb-2">
                    <div className="flex items-center gap-2">
                        <input type="checkbox" name="published" id="published" className="w-5 h-5" defaultChecked />
                        <Label htmlFor="published">Langsung Publish</Label>
                    </div>
                </div>
            </div>
        </div>

        <div className="bg-[#1e1e1e] p-8 rounded-3xl border-2 border-gray-700 shadow-sm space-y-6 text-white">
            <h3 className="font-bold text-xl">Technical Config</h3>
            
            <div className="space-y-2">
                <Label htmlFor="starterCode" className="text-gray-300">Starter Code</Label>
                <Textarea 
                    id="starterCode" 
                    name="starterCode" 
                    placeholder="# Code that appears when user opens editor" 
                    className="rounded-xl h-40 font-mono text-sm bg-[#252526] border-gray-600 text-gray-300" 
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="expectedOutput" className="text-gray-300">Expected Output (Untuk Python/JS)</Label>
                <Textarea 
                    id="expectedOutput" 
                    name="expectedOutput" 
                    placeholder="Output yang diharapkan di console..." 
                    className="rounded-xl h-24 font-mono text-sm bg-[#252526] border-gray-600 text-gray-300" 
                />
                <p className="text-xs text-gray-500">Kosongkan jika kategori Web atau Scratch.</p>
            </div>
        </div>

        <Button type="submit" className="w-full bg-[#FF5656] hover:bg-[#CC0000] text-white font-bold rounded-xl py-6 text-lg">
            Simpan Tantangan
        </Button>
      </form>
    </div>
  )
}
