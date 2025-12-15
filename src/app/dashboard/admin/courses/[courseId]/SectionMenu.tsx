'use client'

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createQuiz, deleteQuiz } from "@/app/actions/admin-quiz-actions"
import { HelpCircle, Trash, Plus, Edit } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface SectionMenuProps {
  courseId: string
  sectionId: string
  quizzes: any[]
}

export function SectionMenu({ courseId, sectionId, quizzes }: SectionMenuProps) {
  const [quizDialogOpen, setQuizDialogOpen] = useState(false)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" className="text-orange-500 hover:bg-orange-50">
          <HelpCircle className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-xl w-56">
        <DropdownMenuLabel>Manajemen Kuis</DropdownMenuLabel>
        
        {quizzes && quizzes.length > 0 ? (
          <>
            <Link href={`/dashboard/admin/courses/${courseId}/sections/${sectionId}/quiz/${quizzes[0].id}`}>
              <DropdownMenuItem className="cursor-pointer">
                <Edit className="mr-2 h-4 w-4" /> Edit Kuis
              </DropdownMenuItem>
            </Link>
            
            <form action={deleteQuiz.bind(null, quizzes[0].id, courseId) as any}>
              <button className="w-full text-left">
                <DropdownMenuItem className="cursor-pointer text-red-600">
                  <Trash className="mr-2 h-4 w-4" /> Hapus Kuis
                </DropdownMenuItem>
              </button>
            </form>
          </>
        ) : (
          <Dialog open={quizDialogOpen} onOpenChange={setQuizDialogOpen}>
            <DialogTrigger asChild>
              <DropdownMenuItem 
                onSelect={(e) => e.preventDefault()} 
                className="cursor-pointer text-blue-600"
              >
                <Plus className="mr-2 h-4 w-4" /> Buat Kuis Baru
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-2xl">
              <DialogHeader>
                <DialogTitle>Buat Kuis Baru</DialogTitle>
              </DialogHeader>
              <form action={async (formData) => {
                  await createQuiz(sectionId, formData)
                  setQuizDialogOpen(false)
              }} className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Judul Kuis</Label>
                  <Input name="title" placeholder="Contoh: Evaluasi Bab 1" required className="rounded-xl" />
                </div>
                <div className="grid gap-2">
                  <Label>Durasi (Menit)</Label>
                  <Input type="number" name="duration" defaultValue={15} className="rounded-xl" />
                </div>
                <input type="hidden" name="courseId" value={courseId} />
                <Button type="submit" className="bg-blue-600 text-white font-bold rounded-xl">Simpan & Lanjut</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
