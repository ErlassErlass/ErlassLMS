"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Send, Trash2, Reply } from "lucide-react"
import { postLessonComment, deleteLessonComment } from "@/app/actions/discussion-actions"
import { toast } from "sonner"

interface Comment {
    id: string
    content: string
    createdAt: Date
    user: { id: string, name: string, avatar: string | null, role: string }
    replies: Comment[]
}

interface LessonDiscussionProps {
    sectionId: string
    courseId: string
    initialComments: Comment[]
    currentUserId: string
    userRole: string
    commentsEnabled: boolean
}

export function LessonDiscussion({ 
    sectionId, 
    courseId,
    initialComments, 
    currentUserId,
    userRole,
    commentsEnabled
}: LessonDiscussionProps) {
    const [comments, setComments] = useState<Comment[]>(initialComments)
    const [newComment, setNewComment] = useState("")
    const [replyTo, setReplyTo] = useState<string | null>(null)
    const [replyContent, setReplyContent] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent, parentId?: string) => {
        e.preventDefault()
        const content = parentId ? replyContent : newComment
        if (!content.trim()) return

        setIsSubmitting(true)
        const result = await postLessonComment(sectionId, content, parentId)
        
        if (result.success && result.data) {
            toast.success("Komentar terkirim")
            if (parentId) {
                setReplyContent("")
                setReplyTo(null)
            } else {
                setNewComment("")
            }
            // In a real app we'd optimistically update or re-fetch, 
            // but Server Action revalidatePath handles the refresh for next visit.
            // For immediate feedback, we can push to local state if we want, 
            // but since page refreshes might not be instant in client components without router.refresh(),
            // let's rely on full page reload or router.refresh() if available.
            // For now, simple toast is enough, user will see it on refresh.
            // Or better:
            window.location.reload() 
        } else {
            toast.error(result.error || "Gagal mengirim komentar")
        }
        setIsSubmitting(false)
    }

    const handleDelete = async (commentId: string) => {
        if (!confirm("Hapus komentar ini?")) return
        const result = await deleteLessonComment(commentId, sectionId, courseId)
        if (result.success) {
            toast.success("Komentar dihapus")
            window.location.reload()
        } else {
            toast.error(result.error)
        }
    }

    if (!commentsEnabled && userRole === 'USER') {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-500">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Komentar dinonaktifkan untuk materi ini.</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-bold">Diskusi ({comments.length})</h3>
            </div>

            {/* Post Form */}
            <form onSubmit={(e) => handleSubmit(e)} className="flex gap-4">
                <Avatar>
                    <AvatarFallback>ME</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                    <Textarea 
                        placeholder="Tulis pertanyaan atau komentar..." 
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        className="min-h-[80px]"
                    />
                    <div className="flex justify-end">
                        <Button disabled={isSubmitting || !newComment.trim()}>
                            <Send className="h-4 w-4 mr-2" />
                            Kirim
                        </Button>
                    </div>
                </div>
            </form>

            {/* List */}
            <div className="space-y-6">
                {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4">
                        <Avatar>
                            <AvatarImage src={comment.user.avatar || ""} />
                            <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm">{comment.user.name}</span>
                                    {comment.user.role !== 'USER' && (
                                        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                                            {comment.user.role}
                                        </span>
                                    )}
                                    <span className="text-xs text-gray-500">
                                        {new Date(comment.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                {(currentUserId === comment.user.id || userRole !== 'USER') && (
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => handleDelete(comment.id)}>
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                )}
                            </div>
                            
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                            
                            {/* Reply Action */}
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                                    className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1"
                                >
                                    <Reply className="h-3 w-3" /> Balas
                                </button>
                            </div>

                            {/* Reply Form */}
                            {replyTo === comment.id && (
                                <form onSubmit={(e) => handleSubmit(e, comment.id)} className="mt-4 flex gap-3 animate-in fade-in slide-in-from-top-2">
                                    <div className="flex-1">
                                        <Textarea 
                                            placeholder="Balas komentar ini..." 
                                            value={replyContent}
                                            onChange={e => setReplyContent(e.target.value)}
                                            className="min-h-[60px] text-sm"
                                            autoFocus
                                        />
                                        <div className="flex justify-end gap-2 mt-2">
                                            <Button type="button" variant="ghost" size="sm" onClick={() => setReplyTo(null)}>Batal</Button>
                                            <Button size="sm" disabled={isSubmitting || !replyContent.trim()}>Kirim Balasan</Button>
                                        </div>
                                    </div>
                                </form>
                            )}

                            {/* Replies List */}
                            {comment.replies.length > 0 && (
                                <div className="mt-4 pl-4 border-l-2 border-gray-100 space-y-4">
                                    {comment.replies.map(reply => (
                                        <div key={reply.id} className="flex gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={reply.user.avatar || ""} />
                                                <AvatarFallback className="text-xs">{reply.user.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-xs">{reply.user.name}</span>
                                                    {reply.user.role !== 'USER' && (
                                                        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                                                            {reply.user.role}
                                                        </span>
                                                    )}
                                                    {(currentUserId === reply.user.id || userRole !== 'USER') && (
                                                        <button className="ml-auto text-gray-400 hover:text-red-500" onClick={() => handleDelete(reply.id)}>
                                                            <Trash2 className="h-3 w-3" />
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600">{reply.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
