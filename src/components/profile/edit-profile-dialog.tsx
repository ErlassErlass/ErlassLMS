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
import { Textarea } from "@/components/ui/textarea"
import { updateProfile } from "@/app/actions/profile-actions"
import { toast } from "sonner"
import { Pencil, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface EditProfileDialogProps {
  user: {
    name: string
    email: string
    phone?: string | null
    role: string
    mentorProfile?: {
        bio?: string | null
    } | null
  }
}

export function EditProfileDialog({ user }: EditProfileDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const result = await updateProfile(formData)

    if (result.success) {
      toast.success("Profil berhasil diperbarui")
      setOpen(false)
      router.refresh()
    } else {
      toast.error(result.error || "Gagal memperbarui profil")
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-white/20 hover:bg-white/10 text-white bg-white/5">
          <Pencil className="h-4 w-4" />
          Edit Profil
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profil</DialogTitle>
          <DialogDescription>
            Ubah informasi profil kamu di sini. Klik simpan jika sudah selesai.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input id="name" name="name" defaultValue={user.name} required />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user.email} disabled className="bg-muted" />
            <p className="text-[10px] text-muted-foreground">Email tidak dapat diubah.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Nomor Telepon</Label>
            <Input id="phone" name="phone" defaultValue={user.phone || ""} placeholder="08..." />
          </div>

          {user.role === 'MENTOR' && (
              <div className="space-y-2">
                <Label htmlFor="bio">Bio Mentor</Label>
                <Textarea 
                    id="bio" 
                    name="bio" 
                    defaultValue={user.mentorProfile?.bio || ""} 
                    placeholder="Ceritakan tentang pengalaman mengajar kamu..." 
                />
              </div>
          )}

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
