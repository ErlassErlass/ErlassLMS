
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { createQuestion, deleteQuestion } from "@/app/actions/question-bank-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ChevronLeft, Plus, Trash2, HelpCircle, Image as ImageIcon, Video, Mic } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

async function getQuestionBank(id: string) {
  return await prisma.questionBank.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { createdAt: 'asc' }
      }
    }
  })
}

export default async function ManageQuestionBankPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'SUPERADMIN') redirect('/dashboard')

  const { id } = await params
  const bank = await getQuestionBank(id)
  if (!bank) redirect('/dashboard/admin/question-banks')

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-12 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/admin/question-banks">
          <Button variant="outline" size="icon" className="rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
            <h1 className="text-3xl font-black text-[#1F2937] dark:text-white">{bank.title}</h1>
            <p className="text-gray-500">{bank.description} • {bank.questions.length} Soal</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: List of Questions */}
        <div className="lg:col-span-2 space-y-6">
          {bank.questions.length === 0 ? (
             <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                <HelpCircle className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <h3 className="text-lg font-bold text-gray-600 dark:text-gray-400">Belum ada soal</h3>
                <p className="text-gray-500">Gunakan formulir di kanan untuk menambah soal.</p>
             </div>
          ) : (
            bank.questions.map((q, index) => (
              <Card key={q.id} className="border-2 border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <CardHeader className="bg-gray-50 dark:bg-gray-800/50 py-3 px-5 flex flex-row items-center justify-between">
                  <div className="font-bold text-gray-500">Soal #{index + 1} • {q.points} Poin</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                        {q.questionType === 'MULTIPLE_CHOICE' ? 'Pilihan Ganda' : 'Benar/Salah'}
                    </span>
                    <form action={deleteQuestion.bind(null, q.id, bank.id) as any}>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </form>
                  </div>
                </CardHeader>
                <CardContent className="p-5">
                  {q.mediaUrl && (
                    <div className="mb-4 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                        {q.mediaType === 'IMAGE' && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={q.mediaUrl} alt="Question Media" className="max-h-64 object-contain bg-black/5 w-full" />
                        )}
                        {q.mediaType === 'VIDEO' && (
                            <div className="aspect-video bg-black">
                                <iframe src={q.mediaUrl.replace('watch?v=', 'embed/')} className="w-full h-full" allowFullScreen />
                            </div>
                        )}
                        {q.mediaType === 'AUDIO' && (
                            <div className="p-4 bg-gray-50 flex items-center gap-3">
                                <Mic className="h-5 w-5 text-gray-500" />
                                <audio controls src={q.mediaUrl} className="w-full" />
                            </div>
                        )}
                    </div>
                  )}

                  <p className="font-medium text-lg mb-4">{q.questionText}</p>
                  
                  {/* Options Display */}
                  <div className="space-y-2 pl-4 border-l-2 border-gray-100 dark:border-gray-700">
                    {Array.isArray(q.options) && q.options.map((opt: any) => (
                        <div key={opt.id} className={`flex items-center gap-3 ${opt.id === q.correctAnswer ? 'text-green-600 font-bold' : 'text-gray-600'}`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border ${opt.id === q.correctAnswer ? 'bg-green-100 border-green-500' : 'border-gray-300'}`}>
                                {opt.id}
                            </div>
                            <span>{opt.text}</span>
                            {opt.id === q.correctAnswer && <span className="text-xs bg-green-100 px-2 py-0.5 rounded ml-auto">Jawaban Benar</span>}
                        </div>
                    ))}
                  </div>
                  
                  {q.explanation && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <p className="text-sm text-gray-500">
                            <span className="font-bold">Penjelasan:</span> {q.explanation}
                        </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Right: Add New Question Form */}
        <div className="space-y-6">
          <Card className="border-2 border-gray-100 dark:border-gray-700 shadow-sm sticky top-24">
            <CardHeader className="bg-[#FF5656] text-white rounded-t-xl">
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" /> Tambah Soal
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form action={createQuestion.bind(null, bank.id) as any} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="q_type">Tipe Soal</Label>
                    <select id="q_type" name="questionType" className="w-full p-2 rounded-xl border bg-background">
                        <option value="MULTIPLE_CHOICE">Pilihan Ganda</option>
                        <option value="TRUE_FALSE">Benar / Salah</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="q_text">Pertanyaan</Label>
                    <Textarea id="q_text" name="questionText" placeholder="Tulis pertanyaan di sini..." required className="rounded-xl min-h-[100px]" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="q_points">Poin</Label>
                    <Input type="number" id="q_points" name="points" defaultValue="10" className="rounded-xl" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 space-y-2">
                        <Label htmlFor="q_media">URL Media (Opsional)</Label>
                        <Input id="q_media" name="mediaUrl" placeholder="https://..." className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="q_mediaType">Tipe</Label>
                        <select id="q_mediaType" name="mediaType" className="w-full p-2 rounded-xl border bg-background">
                            <option value="">- None -</option>
                            <option value="IMAGE">Gambar</option>
                            <option value="VIDEO">Video</option>
                            <option value="AUDIO">Audio</option>
                        </select>
                    </div>
                </div>

                {/* This part ideally should be dynamic based on type, but for MVP form submission we handle basic fields */}
                <div className="space-y-2 pt-2 border-t">
                    <Label className="text-base">Opsi Jawaban (Untuk Pilihan Ganda)</Label>
                    <div className="grid gap-2">
                        <div className="flex gap-2 items-center">
                            <span className="w-6 text-center font-bold">A</span>
                            <Input name="optionA" placeholder="Opsi A" className="rounded-xl" />
                        </div>
                        <div className="flex gap-2 items-center">
                            <span className="w-6 text-center font-bold">B</span>
                            <Input name="optionB" placeholder="Opsi B" className="rounded-xl" />
                        </div>
                        <div className="flex gap-2 items-center">
                            <span className="w-6 text-center font-bold">C</span>
                            <Input name="optionC" placeholder="Opsi C" className="rounded-xl" />
                        </div>
                        <div className="flex gap-2 items-center">
                            <span className="w-6 text-center font-bold">D</span>
                            <Input name="optionD" placeholder="Opsi D" className="rounded-xl" />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="q_correct">Jawaban Benar</Label>
                    <select id="q_correct" name="correctAnswer" className="w-full p-2 rounded-xl border bg-background">
                        <option value="A">A (Pilihan Ganda)</option>
                        <option value="B">B (Pilihan Ganda)</option>
                        <option value="C">C (Pilihan Ganda)</option>
                        <option value="D">D (Pilihan Ganda)</option>
                        <option disabled>---</option>
                        <option value="true">Benar (True/False)</option>
                        <option value="false">Salah (True/False)</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="q_exp">Penjelasan (Opsional)</Label>
                    <Textarea id="q_exp" name="explanation" placeholder="Muncul setelah menjawab..." className="rounded-xl h-20" />
                </div>

                <Button type="submit" className="w-full bg-[#1F2937] text-white font-bold rounded-xl py-4 mt-4">
                    Simpan Soal
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
