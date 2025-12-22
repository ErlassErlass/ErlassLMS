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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, ImageIcon } from "lucide-react"
import { createBadge, updateBadge } from "@/app/actions/admin-badge-actions"
import { toast } from "sonner"

interface BadgeDialogProps {
  badge?: any
  courses: { id: string, title: string }[]
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function BadgeDialog({ badge, courses, open, onOpenChange }: BadgeDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [criteriaType, setCriteriaType] = useState(badge?.criteriaType || "MANUAL")
  const [isPending, setIsPending] = useState(false)
  const [iconType, setIconType] = useState<'file' | 'emoji'>(badge?.imageUrl && badge?.imageUrl.startsWith('/uploads') ? 'file' : 'emoji')

  const showDialog = open !== undefined ? open : isOpen
  const setShowDialog = onOpenChange || setIsOpen

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    try {
      const action = badge ? updateBadge.bind(null, badge.id) : createBadge
      const res = await action(formData)
      
      if (res.success) {
        toast.success(badge ? "Badge updated" : "Badge created")
        setShowDialog(false)
      } else {
        toast.error(res.error)
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      {!badge && (
        <DialogTrigger asChild>
          <Button className="bg-[#FF5656] hover:bg-[#CC0000] text-white font-bold rounded-xl shadow-md">
            <Plus className="mr-2 h-4 w-4" /> Buat Badge
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px] rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{badge ? "Edit Badge" : "Buat Badge Baru"}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nama Badge</Label>
            <Input id="name" name="name" defaultValue={badge?.name} required className="rounded-lg" />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Input id="description" name="description" defaultValue={badge?.description} required className="rounded-lg" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label>Icon Badge</Label>
                <div className="flex gap-2 mb-2">
                    <Button 
                        type="button" 
                        variant={iconType === 'file' ? 'default' : 'outline'} 
                        size="sm" 
                        onClick={() => setIconType('file')}
                        className="flex-1 rounded-lg text-xs"
                    >
                        <ImageIcon className="h-3 w-3 mr-1" /> Upload
                    </Button>
                    <Button 
                        type="button" 
                        variant={iconType === 'emoji' ? 'default' : 'outline'} 
                        size="sm" 
                        onClick={() => setIconType('emoji')}
                        className="flex-1 rounded-lg text-xs"
                    >
                        😃 Emoji
                    </Button>
                </div>
                
                {iconType === 'emoji' ? (
                    <Input id="imageUrlText" name="imageUrlText" placeholder="Contoh: 🏆" defaultValue={badge?.imageUrl?.startsWith('data:image') || badge?.imageUrl?.startsWith('/') || badge?.imageUrl?.startsWith('http') ? '' : badge?.imageUrl} className="rounded-lg" />
                ) : (
                    <div className="space-y-2">
                        <Input type="file" id="imageFile" name="imageFile" accept="image/*" className="rounded-lg bg-gray-50 dark:bg-gray-800" />
                        <input type="hidden" name="currentImageUrl" value={badge?.imageUrl || ''} />
                        {(badge?.imageUrl && (badge?.imageUrl.startsWith('data:image') || badge?.imageUrl.startsWith('/') || badge?.imageUrl.startsWith('http'))) && (
                            <div className="relative w-12 h-12 rounded-full overflow-hidden border border-gray-200">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={badge.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className="grid gap-2">
                <Label htmlFor="xpReward">XP Reward</Label>
                <Input type="number" id="xpReward" name="xpReward" defaultValue={badge?.xpReward || 50} className="rounded-lg" />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Kategori</Label>
            <Input id="category" name="category" defaultValue={badge?.category || "Achievement"} className="rounded-lg" />
          </div>

          {/* ... criteria section same ... */}
          <div className="border-t pt-4 mt-2 space-y-4">
            <h4 className="font-bold text-sm">Kriteria Otomatis</h4>
            
            <div className="grid gap-2">
                <Label>Tipe Kriteria</Label>
                <Select name="criteriaType" value={criteriaType} onValueChange={setCriteriaType}>
                    <SelectTrigger className="rounded-lg">
                        <SelectValue placeholder="Pilih Kriteria" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="MANUAL">Manual (Diberikan Admin)</SelectItem>
                        <SelectItem value="COURSE_COMPLETION">Menyelesaikan Kursus</SelectItem>
                        <SelectItem value="CHALLENGE_COUNT">Jumlah Tantangan Selesai</SelectItem>
                        <SelectItem value="XP_MILESTONE">Mencapai XP Tertentu</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {criteriaType === 'COURSE_COMPLETION' && (
                <div className="grid gap-2">
                    <Label>Pilih Kursus</Label>
                    <Select name="criteriaValue" defaultValue={badge?.criteriaValue}>
                        <SelectTrigger className="rounded-lg">
                            <SelectValue placeholder="Pilih Kursus" />
                        </SelectTrigger>
                        <SelectContent>
                            {courses.map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {criteriaType === 'CHALLENGE_COUNT' && (
                <div className="grid gap-2">
                    <Label>Jumlah Tantangan</Label>
                    <Input type="number" name="criteriaValue" defaultValue={badge?.criteriaValue} placeholder="Contoh: 5" className="rounded-lg" />
                </div>
            )}

            {criteriaType === 'XP_MILESTONE' && (
                <div className="grid gap-2">
                    <Label>Target XP</Label>
                    <Input type="number" name="criteriaValue" defaultValue={badge?.criteriaValue} placeholder="Contoh: 1000" className="rounded-lg" />
                </div>
            )}
          </div>

          <Button type="submit" disabled={isPending} className="bg-[#1F2937] text-white font-bold rounded-lg mt-2">
            {isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
