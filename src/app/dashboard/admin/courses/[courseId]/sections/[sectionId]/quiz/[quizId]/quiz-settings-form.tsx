'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateQuiz } from "@/app/actions/admin-quiz-actions"
import { Save, Loader2 } from "lucide-react"
import { useState } from "react"

export function QuizSettingsForm({ quiz }: { quiz: any }) {
    const [loading, setLoading] = useState(false)

    return (
        <form action={async (formData) => {
            setLoading(true)
            await updateQuiz(quiz.id, formData)
            setLoading(false)
        }} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="title">Judul Kuis</Label>
                <Input id="title" name="title" defaultValue={quiz.title} className="rounded-xl" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="duration">Durasi (Menit)</Label>
                <Input id="duration" name="duration" type="number" defaultValue={quiz.duration || 0} className="rounded-xl" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="maxAttempts">Maksimal Percobaan</Label>
                <Input id="maxAttempts" name="maxAttempts" type="number" defaultValue={quiz.maxAttempts} className="rounded-xl" />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-[#1F2937] text-white font-bold rounded-xl mt-2">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} 
                Simpan Pengaturan
            </Button>
            <p className="text-xs text-gray-400 text-center">Perubahan akan langsung tersimpan.</p>
        </form>
    )
}
