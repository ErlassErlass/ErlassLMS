'use client'

import { useState } from "react"
import { createBackupAction, deleteBackupAction } from "@/app/actions/backup-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Download, Trash2, FileArchive, Loader2, ShieldAlert } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface BackupFile {
    name: string
    size: number
    createdAt: Date
    url: string
}

function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export default function BackupClient({ initialBackups }: { initialBackups: BackupFile[] }) {
    const [backups, setBackups] = useState(initialBackups)
    const [isCreating, setIsCreating] = useState(false)
    const router = useRouter()

    async function handleCreateBackup() {
        setIsCreating(true)
        try {
            const res = await createBackupAction() as any
            if (res.success && res.downloadUrl) {
                toast.success("Backup berhasil dibuat!")
                // Trigger download automatically or just refresh list?
                // Let's refresh list.
                // window.open(res.downloadUrl, '_blank') 
                router.refresh()
            } else {
                toast.error(res.error || "Gagal membuat backup. Pastikan pg_dump terinstall.")
            }
        } catch (error) {
            toast.error("Terjadi kesalahan sistem")
        } finally {
            setIsCreating(false)
        }
    }

    async function handleDelete(filename: string) {
        if(!confirm("Hapus file backup ini?")) return

        const res = await deleteBackupAction(filename)
        if (res.success) {
            toast.success("File dihapus")
            router.refresh()
        } else {
            toast.error("Gagal menghapus file")
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-[#1F2937] dark:text-white">System Backup</h2>
                    <p className="text-gray-500">Amankan data database dan file upload Anda.</p>
                </div>
                <Button 
                    onClick={handleCreateBackup} 
                    disabled={isCreating}
                    className="bg-[#1F2937] hover:bg-black text-white font-bold rounded-xl"
                >
                    {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    Buat Backup Baru
                </Button>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-800">
                    <p className="font-bold">Penting:</p>
                    <p>File backup berisi data sensitif (database lengkap & kredensial). Simpan di tempat yang aman. Backup dibuat menggunakan `pg_dump`, pastikan tools PostgreSQL terinstall di server.</p>
                </div>
            </div>

            <Card className="border-2 border-gray-100 dark:border-gray-700 shadow-sm rounded-3xl">
                <CardHeader>
                    <CardTitle>Riwayat Backup</CardTitle>
                    <CardDescription>Daftar file backup yang tersimpan di server.</CardDescription>
                </CardHeader>
                <CardContent>
                    {backups.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            Belum ada backup tersedia.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {backups.map((file) => (
                                <div key={file.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border hover:border-gray-300 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                                            <FileArchive className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[#1F2937] dark:text-white">{file.name}</h4>
                                            <p className="text-xs text-gray-500">
                                                {new Date(file.createdAt).toLocaleString('id-ID')} • {formatBytes(file.size)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <a href={file.url} download>
                                            <Button variant="outline" size="sm" className="rounded-lg">
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </a>
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="text-red-500 hover:bg-red-50 rounded-lg"
                                            onClick={() => handleDelete(file.name)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
