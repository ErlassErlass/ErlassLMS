'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { updateSection } from "@/app/actions/admin-course-actions"
import { Edit } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface EditSectionDialogProps {
  section: any
}

export function EditSectionDialog({ section }: EditSectionDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" className="text-blue-500 hover:bg-blue-50">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] rounded-2xl">
        <DialogHeader>
          <DialogTitle>Edit Materi</DialogTitle>
          <DialogDescription>Ubah detail materi pembelajaran.</DialogDescription>
        </DialogHeader>
        <form action={async (formData) => {
            await updateSection(section.id, formData)
            setOpen(false)
        }} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit_title">Judul Bab</Label>
            <Input id="edit_title" name="title" defaultValue={section.title} required className="rounded-lg" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit_desc">Deskripsi</Label>
            <Textarea id="edit_desc" name="description" defaultValue={section.description || ''} className="rounded-lg h-20" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit_video">Video URL</Label>
            <Input id="edit_video" name="videoUrl" defaultValue={section.videoUrl || ''} className="rounded-lg" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit_content">Konten Teks (HTML)</Label>
            <Textarea id="edit_content" name="content" defaultValue={section.content || ''} className="rounded-lg h-32 font-mono text-xs" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="isFree" id={`edit_isFree_${section.id}`} className="w-4 h-4" defaultChecked={section.isFree} />
            <Label htmlFor={`edit_isFree_${section.id}`}>Gratis (Override)</Label>
          </div>
          <Button type="submit" className="bg-[#1F2937] text-white font-bold rounded-lg mt-2">
            Simpan Perubahan
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
