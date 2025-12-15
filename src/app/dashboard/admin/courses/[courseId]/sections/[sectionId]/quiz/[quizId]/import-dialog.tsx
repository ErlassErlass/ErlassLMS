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
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCcw, Loader2 } from "lucide-react"
import { importQuestionsFromBank } from "@/app/actions/admin-quiz-actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function ImportQuestionsDialog({ quizId, banks }: { quizId: string, banks: any[] }) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        const bankId = formData.get('bankId') as string
        const count = parseInt(formData.get('count') as string)

        if(!bankId || !count) {
            toast.error("Mohon lengkapi data")
            setIsLoading(false)
            return
        }

        const res = await importQuestionsFromBank(quizId, bankId, count)
        if(res.success) {
            toast.success(`Berhasil mengimpor ${res.count} soal`)
            setOpen(false)
            router.refresh()
        } else {
            toast.error(res.error || "Gagal impor soal")
        }
        setIsLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="rounded-xl border-dashed border-2 hover:border-blue-500 hover:text-blue-600">
                    <RefreshCcw className="mr-2 h-4 w-4" /> Impor dari Bank Soal
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-2xl">
                <DialogHeader>
                    <DialogTitle>Impor Soal Otomatis</DialogTitle>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Pilih Bank Soal</Label>
                        <Select name="bankId">
                            <SelectTrigger className="rounded-xl">
                                <SelectValue placeholder="Pilih Bank..." />
                            </SelectTrigger>
                            <SelectContent>
                                {banks.map(bank => (
                                    <SelectItem key={bank.id} value={bank.id}>
                                        {bank.title} ({bank._count.questions} Soal)
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Jumlah Soal Diambil (Acak)</Label>
                        <Input type="number" name="count" defaultValue={5} min={1} max={50} className="rounded-xl" />
                    </div>
                    <Button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Impor Sekarang"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
