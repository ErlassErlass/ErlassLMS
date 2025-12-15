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
import { generateBulkVouchers } from "@/app/actions/admin-voucher-actions"
import { toast } from "sonner"
import { Copy, Loader2, Ticket } from "lucide-react"

export function BulkVoucherDialog() {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    try {
      const res = await generateBulkVouchers(formData)
      if (res.success) {
        toast.success(`Berhasil membuat ${res.count} kode kupon unik`)
        setOpen(false)
      } else {
        toast.error(res.error)
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-dashed border-2 font-bold text-gray-600 hover:border-gray-400">
          <Copy className="mr-2 h-4 w-4" /> Generate Bulk (Kupon)
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-orange-500" />
            Generate Kupon Unik (Bulk)
          </DialogTitle>
        </DialogHeader>
        
        <form action={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label>Prefix Kode</Label>
                <Input name="prefix" placeholder="Contoh: WEBINAR" className="uppercase rounded-xl" required />
                <p className="text-[10px] text-gray-500">Akan menjadi: WEBINAR-XXXX</p>
            </div>
            <div className="space-y-2">
                <Label>Jumlah Kupon</Label>
                <Input type="number" name="quantity" defaultValue={10} min={1} max={100} className="rounded-xl" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Deskripsi Event</Label>
            <Input name="description" placeholder="Untuk peserta webinar..." className="rounded-xl" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label>Tipe Diskon</Label>
                <Select name="discountType" defaultValue="PERCENTAGE">
                    <SelectTrigger className="rounded-xl">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="PERCENTAGE">Persentase (%)</SelectItem>
                        <SelectItem value="FIXED">Nominal (Rp)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label>Nilai Diskon</Label>
                <Input type="number" name="discountValue" placeholder="100" required className="rounded-xl" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label>Min. Belanja (Rp)</Label>
                <Input type="number" name="minPurchase" defaultValue={0} className="rounded-xl" />
            </div>
            <div className="space-y-2">
                <Label>Kadaluarsa (Opsional)</Label>
                <Input type="date" name="expiresAt" className="rounded-xl" />
            </div>
          </div>

          <div className="bg-blue-50 text-blue-700 text-xs p-3 rounded-xl">
            <strong>Info:</strong> Mode Bulk akan membuat kupon 1x pakai (Single Use). Cocok untuk hadiah atau redeem code personal.
          </div>

          <Button type="submit" disabled={isPending} className="w-full bg-[#1F2937] text-white font-bold rounded-xl h-11">
            {isPending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Generate Sekarang"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
