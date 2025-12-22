'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getLessonComments(sectionId: string) {
  const session = await getServerSession(authOptions)
  if (!session) return { error: "Unauthorized" }

  try {
    const comments = await prisma.lessonComment.findMany({
        where: { sectionId, parentId: null },
        include: {
            user: { select: { id: true, name: true, avatar: true, role: true } },
            replies: {
                include: {
                    user: { select: { id: true, name: true, avatar: true, role: true } }
                },
                orderBy: { createdAt: 'asc' }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    return { success: true, data: comments }
  } catch (error) {
    return { error: "Failed to fetch comments" }
  }
}

export async function postLessonComment(sectionId: string, content: string, parentId?: string) {
  const session = await getServerSession(authOptions)
  if (!session) return { error: "Unauthorized" }

  try {
    // Check if comments are enabled for this section
    const section = await prisma.courseSection.findUnique({
        where: { id: sectionId },
        include: { course: true }
    })

    if (!section?.enableComments) {
        return { error: "Komentar dinonaktifkan untuk materi ini." }
    }

    const comment = await prisma.lessonComment.create({
        data: {
            sectionId,
            userId: session.user.id,
            content,
            parentId
        }
    })

    revalidatePath(`/dashboard/courses/${section.courseId}/learn/${sectionId}`)
    return { success: true, data: comment }
  } catch (error) {
    return { error: "Failed to post comment" }
  }
}

export async function deleteLessonComment(commentId: string, sectionId: string, courseId: string) {
    const session = await getServerSession(authOptions)
    if (!session) return { error: "Unauthorized" }

    try {
        const comment = await prisma.lessonComment.findUnique({ where: { id: commentId } })
        
        if (!comment) return { error: "Comment not found" }

        // Allow deletion by owner or admin/mentor
        if (comment.userId !== session.user.id && session.user.role === 'USER') {
            return { error: "Forbidden" }
        }

        await prisma.lessonComment.delete({ where: { id: commentId } })
        
        revalidatePath(`/dashboard/courses/${courseId}/learn/${sectionId}`)
        return { success: true }
    } catch (error) {
        return { error: "Failed to delete comment" }
    }
}

export async function toggleSectionComments(sectionId: string, enabled: boolean, courseId: string) {
    const session = await getServerSession(authOptions)
    if (session?.user.role === 'USER') return { error: "Unauthorized" }

    try {
        await prisma.courseSection.update({
            where: { id: sectionId },
            data: { enableComments: enabled }
        })
        
        revalidatePath(`/dashboard/courses/${courseId}/learn/${sectionId}`)
        return { success: true }
    } catch (error) {
        return { error: "Failed to update settings" }
    }
}
