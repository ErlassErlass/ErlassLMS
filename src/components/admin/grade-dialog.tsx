'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { gradeSubmission } from "@/app/actions/admin-class-actions"
import { toast } from "sonner"
import { PenTool, Loader2 } from "lucide-react"

// --- Types ---

interface GradeDialogProps {
    submissionId: string
    currentGrade: number | null
    currentFeedback: string | null
}

// --- Component ---

export function GradeDialog({ submissionId, currentGrade, currentFeedback }: GradeDialogProps) {
    const [open, setOpen] = useState(false)
    // Initialize with string to handle empty input gracefully
    const [grade, setGrade] = useState<string>(currentGrade?.toString() || "")
    const [feedback, setFeedback] = useState(currentFeedback || "")
    const [isSubmitting, setIsSubmitting] = useState(false)

    async function handleSave() {
        // Validation
        const parsedGrade = parseInt(grade)
        
        if (grade === "" || isNaN(parsedGrade)) {
            toast.error("Mohon masukkan nilai yang valid")
            return
        }

        if (parsedGrade < 0 || parsedGrade > 100) {
            toast.error("Nilai harus antara 0 dan 100")
            return
        }

        setIsSubmitting(true)

        try {
            const res = await gradeSubmission(submissionId, parsedGrade, feedback)
            
            if (res.success) {
                toast.success("Nilai berhasil disimpan")
                setOpen(false)
            } else {
                toast.error(res.error || "Gagal menyimpan nilai")
            }
        } catch (error) {
            toast.error("Terjadi kesalahan sistem")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700 hover:bg-blue-50">
                    <PenTool className="h-4 w-4" />
                    <span className="sr-only">Grade Submission</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Beri Nilai & Feedback</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="grade-input">Nilai (0-100)</Label>
                        <Input 
                            id="grade-input"
                            type="number" 
                            min="0"
                            max="100"
                            placeholder="0"
                            value={grade} 
                            onChange={e => setGrade(e.target.value)} 
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="feedback-input">Feedback untuk Siswa</Label>
                        <Textarea 
                            id="feedback-input"
                            placeholder="Berikan masukan yang membangun..." 
                            value={feedback} 
                            onChange={e => setFeedback(e.target.value)} 
                            className="min-h-[100px]"
                        />
                    </div>

                    <Button onClick={handleSave} disabled={isSubmitting} className="w-full">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSubmitting ? "Menyimpan..." : "Simpan Penilaian"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
