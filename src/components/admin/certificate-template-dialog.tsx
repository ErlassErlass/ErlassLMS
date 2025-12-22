'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Upload } from "lucide-react"
import { createCertificateTemplate } from "@/app/actions/admin-certificate-template-actions"
import { toast } from "sonner"

export function CertificateTemplateDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    try {
      const res = await createCertificateTemplate(formData)
      if (res.success) {
        toast.success("Template berhasil dibuat")
        setIsOpen(false)
        setPreview(null)
      } else {
        toast.error(res.error)
      }
    } catch (error) {
      toast.error("Terjadi kesalahan")
    } finally {
      setIsPending(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreview(url)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#1F2937] text-white">
          <Plus className="mr-2 h-4 w-4" /> Upload Template
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Template Sertifikat</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nama Template</Label>
            <Input id="name" name="name" required placeholder="Contoh: Sertifikat Kelulusan 2024" />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="imageFile">File Gambar Background</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors relative">
                <Input 
                    type="file" 
                    id="imageFile" 
                    name="imageFile" 
                    accept="image/*" 
                    required 
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                />
                {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview} alt="Preview" className="max-h-40 object-contain rounded" />
                ) : (
                    <>
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Klik untuk upload (JPG, PNG)</p>
                    </>
                )}
            </div>
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending ? "Mengupload..." : "Simpan Template"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
