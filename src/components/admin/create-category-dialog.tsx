'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { createCategory } from "@/app/actions/admin-category-actions"
import { toast } from "sonner"

export function CreateCategoryDialog() {
    const [open, setOpen] = useState(false)
    const [isPending, setIsPending] = useState(false)

    async function handleSubmit(formData: FormData) {
        setIsPending(true)
        try {
            const res = await createCategory(formData)
            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success("Kategori berhasil dibuat")
                setOpen(false)
            }
        } catch (error) {
            toast.error("Terjadi kesalahan saat membuat kategori")
        } finally {
            setIsPending(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#FF5656] hover:bg-[#CC0000] text-white font-bold rounded-xl shadow-md">
                <Plus className="mr-2 h-4 w-4" /> Tambah Kategori
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-2xl">
            <DialogHeader>
              <DialogTitle>Buat Kategori Baru</DialogTitle>
              <DialogDescription>
                Buat kategori untuk mengelompokkan kursus. Klik simpan jika sudah selesai.
              </DialogDescription>
            </DialogHeader>
            <form action={handleSubmit} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nama Kategori</Label>
                <Input id="name" name="name" placeholder="Misal: Web Development" required className="rounded-lg" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Input id="description" name="description" placeholder="Opsional" className="rounded-lg" />
              </div>
              <Button type="submit" disabled={isPending} className="bg-[#FF5656] text-white font-bold rounded-lg mt-2">
                {isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
    )
}
