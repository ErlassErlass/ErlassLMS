'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { createAnnouncement } from "@/app/actions/admin-class-actions"
import { toast } from "sonner"
import { Megaphone, Send } from "lucide-react"

export function ClassAnnouncementBoard({ classId, announcements, canPost }: { classId: string, announcements: any[], canPost: boolean }) {
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [loading, setLoading] = useState(false)

    async function handlePost(e: React.FormEvent) {
        e.preventDefault()
        if (!title || !content) return

        setLoading(true)
        const res = await createAnnouncement(classId, title, content)
        if (res.success) {
            toast.success("Pengumuman diposting")
            setTitle("")
            setContent("")
            // In real app, we might want to optimistic update or router.refresh
            window.location.reload()
        } else {
            toast.error(res.error)
        }
        setLoading(false)
    }

    return (
        <div className="space-y-6">
            {canPost && (
                <Card className="bg-blue-50 border-blue-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2 text-blue-700">
                            <Megaphone className="h-4 w-4" />
                            Buat Pengumuman Baru
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handlePost} className="space-y-3">
                            <Input 
                                placeholder="Judul Pengumuman" 
                                value={title} 
                                onChange={e => setTitle(e.target.value)} 
                                className="bg-white"
                            />
                            <Textarea 
                                placeholder="Isi pesan untuk seluruh kelas..." 
                                value={content} 
                                onChange={e => setContent(e.target.value)} 
                                className="bg-white min-h-[80px]"
                            />
                            <div className="flex justify-end">
                                <Button size="sm" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                                    <Send className="h-3 w-3 mr-2" />
                                    {loading ? "Posting..." : "Kirim"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-4">
                <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Papan Pengumuman</h3>
                {announcements.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        Belum ada pengumuman kelas.
                    </div>
                ) : (
                    announcements.map((ann) => (
                        <div key={ann.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm relative pl-6">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-purple-400 rounded-l-xl"></div>
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-lg text-gray-800">{ann.title}</h4>
                                <span className="text-xs text-gray-400">
                                    {new Date(ann.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-gray-600 text-sm whitespace-pre-wrap">{ann.content}</p>
                            <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 font-medium">
                                <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
                                    {ann.author.name[0]}
                                </div>
                                {ann.author.name} • {ann.author.role}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
