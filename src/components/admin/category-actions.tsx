'use client'

import { useState } from "react"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateCategory, deleteCategory } from "@/app/actions/admin-category-actions"
import { toast } from "sonner"

interface Category {
    id: string
    name: string
    description: string | null
}

export function CategoryActions({ category }: { category: Category }) {
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isPending, setIsPending] = useState(false)

    async function handleUpdate(formData: FormData) {
        setIsPending(true)
        try {
            const res = await updateCategory(category.id, formData)
            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success("Kategori berhasil diperbarui")
                setIsEditOpen(false)
            }
        } catch (error) {
            toast.error("Gagal memperbarui kategori")
        } finally {
            setIsPending(false)
        }
    }

    async function handleDelete() {
        if (!confirm("Apakah Anda yakin ingin menghapus kategori ini?")) return
        
        try {
            const res = await deleteCategory(category.id)
            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success("Kategori berhasil dihapus")
            }
        } catch (error) {
            toast.error("Gagal menghapus kategori")
        }
    }

    return (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                    <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                    
                    <DialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                    </DialogTrigger>

                    <DropdownMenuItem onSelect={handleDelete} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                        <Trash2 className="mr-2 h-4 w-4" /> Hapus
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <DialogContent className="sm:max-w-[425px] rounded-2xl">
                <DialogHeader>
                    <DialogTitle>Edit Kategori</DialogTitle>
                </DialogHeader>
                <form action={handleUpdate} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor={`name-${category.id}`}>Nama Kategori</Label>
                        <Input id={`name-${category.id}`} name="name" defaultValue={category.name} required className="rounded-lg" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor={`desc-${category.id}`}>Deskripsi</Label>
                        <Input id={`desc-${category.id}`} name="description" defaultValue={category.description || ''} className="rounded-lg" />
                    </div>
                    <Button type="submit" disabled={isPending} className="bg-[#1F2937] text-white font-bold rounded-lg mt-2">
                        {isPending ? "Menyimpan..." : "Simpan Perubahan"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
