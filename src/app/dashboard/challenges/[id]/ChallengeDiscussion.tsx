'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Lock, Send, MessageSquare, ShieldCheck } from "lucide-react"
import { getChallengeComments, postChallengeComment } from "@/app/actions/challenge-discussion-actions"
import { Badge } from "@/components/ui/badge"

export function ChallengeDiscussion({ challengeId }: { challengeId: string }) {
    const [comments, setComments] = useState<any[]>([])
    const [isLocked, setIsLocked] = useState(true)
    const [loading, setLoading] = useState(true)
    const [newComment, setNewComment] = useState("")
    const [posting, setPosting] = useState(false)

    const fetchComments = async () => {
        const res = await getChallengeComments(challengeId)
        if (res.comments) setComments(res.comments)
        if (res.isLocked !== undefined) setIsLocked(res.isLocked)
        setLoading(false)
    }

    useEffect(() => {
        fetchComments()
    }, [challengeId])

    const handleSubmit = async () => {
        if (!newComment.trim()) return
        setPosting(true)
        await postChallengeComment(challengeId, newComment)
        setNewComment("")
        await fetchComments() // Refresh list
        setPosting(false)
    }

    if (loading) return <div className="p-8 text-center text-gray-500">Memuat diskusi...</div>

    if (isLocked) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-center">
                <div className="bg-gray-200 dark:bg-gray-700 p-4 rounded-full mb-4">
                    <Lock className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Diskusi Terkunci</h3>
                <p className="text-sm text-gray-500 max-w-sm mt-2">
                    Fitur diskusi dan hints hanya terbuka setelah kamu mencoba menyelesaikan tantangan ini minimal satu kali (berhasil atau gagal).
                </p>
                <p className="text-xs font-bold text-orange-500 mt-4">Ayo coba submit kodemu sekarang!</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Input Form */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <LabelArea />
                <div className="flex gap-3 mt-2">
                    <Textarea 
                        placeholder="Tulis pertanyaan, hint, atau ide solusimu..." 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="min-h-[80px] rounded-xl bg-gray-50 dark:bg-gray-900 border-transparent focus:border-primary"
                    />
                </div>
                <div className="flex justify-end mt-2">
                    <Button 
                        size="sm" 
                        onClick={handleSubmit} 
                        disabled={posting || !newComment.trim()}
                        className="rounded-lg font-bold"
                    >
                        {posting ? "Mengirim..." : <><Send className="h-3 w-3 mr-2" /> Kirim</>}
                    </Button>
                </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
                {comments.length === 0 ? (
                    <p className="text-center text-gray-400 py-8 italic">Belum ada diskusi. Jadilah yang pertama!</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className={`flex gap-4 p-4 rounded-xl ${comment.isHint ? 'bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800' : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700'}`}>
                            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                <AvatarImage src={comment.user.avatar} />
                                <AvatarFallback>{comment.user.name.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-sm text-gray-900 dark:text-white">{comment.user.name}</span>
                                    {comment.isHint && (
                                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-[10px] gap-1 px-2">
                                            <ShieldCheck className="h-3 w-3" /> Mentor Hint
                                        </Badge>
                                    )}
                                    <span className="text-xs text-gray-400 ml-auto">
                                        {new Date(comment.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                    {comment.content}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

function LabelArea() {
    return (
        <div className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
            <MessageSquare className="h-4 w-4" />
            Diskusi & Bantuan
        </div>
    )
}
