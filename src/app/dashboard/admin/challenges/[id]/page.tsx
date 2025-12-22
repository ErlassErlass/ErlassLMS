
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { updateChallenge } from "@/app/actions/admin-challenge-actions"

export default async function EditChallengePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'SUPERADMIN') redirect('/dashboard')

  const { id } = await params
  const challenge = await prisma.challenge.findUnique({ where: { id } })
  if (!challenge) redirect('/dashboard/admin/challenges')

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-12 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/admin/challenges">
          <Button variant="outline" size="icon" className="rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-black text-[#1F2937] dark:text-white">Edit Tantangan</h1>
      </div>

      <form action={updateChallenge.bind(null, challenge.id) as any} className="space-y-8">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border-2 border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="title">Judul Tantangan</Label>
                    <Input id="title" name="title" defaultValue={challenge.title} required className="rounded-xl" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="category">Kategori</Label>
                    <select id="category" name="category" defaultValue={challenge.category} className="w-full p-2 rounded-xl border bg-background h-10">
                        <option value="python">Python</option>
                        <option value="javascript">JavaScript</option>
                        <option value="web">Web (HTML/CSS)</option>
                        <option value="scratch">Scratch</option>
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Deskripsi Singkat</Label>
                <Input id="description" name="description" defaultValue={challenge.description} required className="rounded-xl" />
            </div>

            <div className="space-y-2">
                <Label htmlFor="instructions">Instruksi Lengkap (HTML Supported)</Label>
                <Textarea id="instructions" name="instructions" defaultValue={challenge.instructions} className="rounded-xl h-40 font-mono text-sm" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="difficulty">Tingkat Kesulitan</Label>
                    <select id="difficulty" name="difficulty" defaultValue={challenge.difficulty} className="w-full p-2 rounded-xl border bg-background h-10">
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="points">XP Reward</Label>
                    <Input type="number" id="points" name="points" defaultValue={challenge.points} className="rounded-xl" />
                </div>
                <div className="space-y-2 flex flex-col justify-end pb-2">
                    <div className="flex items-center gap-2">
                        <input type="checkbox" name="published" id="published" className="w-5 h-5" defaultChecked={challenge.published} />
                        <Label htmlFor="published">Published</Label>
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
                    defaultValue={challenge.starterCode || ''}
                    className="rounded-xl h-40 font-mono text-sm bg-[#252526] border-gray-600 text-gray-300" 
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="expectedOutput" className="text-gray-300">Expected Output (Untuk Python/JS)</Label>
                <Textarea 
                    id="expectedOutput" 
                    name="expectedOutput" 
                    defaultValue={challenge.expectedOutput || ''}
                    className="rounded-xl h-24 font-mono text-sm bg-[#252526] border-gray-600 text-gray-300" 
                />
            </div>
        </div>

        <Button type="submit" className="w-full bg-[#FF5656] hover:bg-[#CC0000] text-white font-bold rounded-xl py-6 text-lg">
            Simpan Perubahan
        </Button>
      </form>
    </div>
  )
}
