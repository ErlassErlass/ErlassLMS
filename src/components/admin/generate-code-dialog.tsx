'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { generateAccessCode } from "@/app/actions/redeem-code-actions"
import { toast } from "sonner"
import { Ticket, Copy, CheckCircle } from "lucide-react"

export function GenerateCodeDialog({ courses }: { courses: any[] }) {
    const [open, setOpen] = useState(false)
    const [selectedCourses, setSelectedCourses] = useState<string[]>([])
    const [maxUsage, setMaxUsage] = useState(1) // Shared Limit OR Quantity
    const [customCode, setCustomCode] = useState("")
    const [loading, setLoading] = useState(false)
    const [mode, setMode] = useState<"single" | "batch">("single")
    const [generatedCodes, setGeneratedCodes] = useState<string[]>([])

    const toggleCourse = (id: string) => {
        setSelectedCourses(prev => 
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        )
    }

    async function handleGenerate() {
        if (selectedCourses.length === 0) {
            toast.error("Pilih minimal 1 kursus")
            return
        }

        setLoading(true)
        const isBatch = mode === "batch"
        const res = await generateAccessCode(selectedCourses, maxUsage, customCode, isBatch)
        
        if (res.success && res.data) {
            const codes = Array.isArray(res.data.code) ? res.data.code : [res.data.code]
            setGeneratedCodes(codes)
            toast.success(`Berhasil membuat ${codes.length} kode!`)
            setSelectedCourses([])
            setCustomCode("")
            // Do NOT close dialog yet, show results
        } else {
            toast.error(res.error)
        }
        setLoading(false)
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success("Disalin ke clipboard")
    }

    const handleReset = () => {
        setGeneratedCodes([])
        setOpen(false)
    }

    if (generatedCodes.length > 0) {
        return (
            <Dialog open={open} onOpenChange={handleReset}>
                <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                        <Ticket className="mr-2 h-4 w-4" /> Buat Kode Akses
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-5 w-5" /> Kode Berhasil Dibuat
                        </DialogTitle>
                        <DialogDescription>
                            Salin kode di bawah ini. Kode ini tidak akan ditampilkan lagi setelah jendela ditutup.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="bg-gray-100 p-4 rounded-lg max-h-[300px] overflow-y-auto space-y-2 font-mono text-sm">
                        {generatedCodes.map((code, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border">
                                <span>{code}</span>
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyToClipboard(code)}>
                                    <Copy className="h-3 w-3" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" className="w-full" onClick={() => copyToClipboard(generatedCodes.join('\n'))}>
                            <Copy className="mr-2 h-4 w-4" /> Salin Semua
                        </Button>
                        <Button onClick={handleReset} className="w-full">Tutup</Button>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <Ticket className="mr-2 h-4 w-4" /> Buat Kode Akses
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Generate Kode Akses (Bundling)</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="single" value={mode} onValueChange={(v: any) => setMode(v)} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="single">Kode Bersama (Shared)</TabsTrigger>
                        <TabsTrigger value="batch">Kode Unik (Batch)</TabsTrigger>
                    </TabsList>

                    <div className="space-y-4 py-2">
                         {/* Common Fields */}
                         <div className="space-y-2">
                            <Label>Pilih Kursus ({selectedCourses.length})</Label>
                            <div className="max-h-[150px] overflow-y-auto border rounded-md p-2 space-y-2 bg-gray-50">
                                {courses.map(course => (
                                    <div key={course.id} className="flex items-center space-x-2">
                                        <Checkbox 
                                            id={course.id} 
                                            checked={selectedCourses.includes(course.id)}
                                            onCheckedChange={() => toggleCourse(course.id)}
                                        />
                                        <label
                                            htmlFor={course.id}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer w-full py-1"
                                        >
                                            {course.title}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <TabsContent value="single" className="space-y-4 mt-0">
                            <div className="p-3 bg-blue-50 text-blue-700 text-xs rounded-lg border border-blue-100">
                                ℹ️ Satu kode yang sama bisa dipakai oleh banyak orang sampai limit habis.
                            </div>
                            <div className="space-y-2">
                                <Label>Kode Kustom (Opsional)</Label>
                                <Input 
                                    placeholder="Contoh: SEKOLAH-JUARA-2024" 
                                    value={customCode}
                                    onChange={e => setCustomCode(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Limit Penggunaan</Label>
                                <Input 
                                    type="number" 
                                    min={1}
                                    value={maxUsage}
                                    onChange={e => setMaxUsage(parseInt(e.target.value))}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="batch" className="space-y-4 mt-0">
                            <div className="p-3 bg-purple-50 text-purple-700 text-xs rounded-lg border border-purple-100">
                                ℹ️ Menghasilkan banyak kode unik berbeda. Tiap kode hanya bisa dipakai 1x.
                            </div>
                            <div className="space-y-2">
                                <Label>Prefix Kode (Opsional)</Label>
                                <Input 
                                    placeholder="Contoh: KLS-A (Hasil: KLS-A-XY123)" 
                                    value={customCode}
                                    onChange={e => setCustomCode(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Jumlah Kode yang Dibuat</Label>
                                <Input 
                                    type="number" 
                                    min={1}
                                    max={100}
                                    value={maxUsage}
                                    onChange={e => setMaxUsage(parseInt(e.target.value))}
                                />
                            </div>
                        </TabsContent>

                        <Button onClick={handleGenerate} disabled={loading} className="w-full mt-4">
                            {loading ? "Memproses..." : mode === 'batch' ? `Generate ${maxUsage} Kode Unik` : "Generate Kode"}
                        </Button>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}

