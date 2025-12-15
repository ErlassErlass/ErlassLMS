'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getChallengeComments(challengeId: string) {
  const session = await getServerSession(authOptions)
  if (!session) return { error: "Unauthorized", comments: [], isLocked: true }

  const userId = session.user.id
  const role = session.user.role

  // 1. Check Unlock Condition
  // Admin/Mentor always unlocked.
  // User must have at least 1 submission (passed or failed).
  let isLocked = false
  
  if (role === 'USER') {
    const submission = await prisma.challengeSubmission.findFirst({
        where: { userId, challengeId }
    })
    if (!submission) {
        isLocked = true
    }
  }

  // 2. Fetch Comments (Only if unlocked or user can't see them anyway)
  // We fetch them anyway but return 'isLocked' flag so UI can hide/blur them
  const comments = await prisma.challengeComment.findMany({
    where: { challengeId },
    include: {
        user: {
            select: { name: true, avatar: true, role: true }
        }
    },
    orderBy: { createdAt: 'desc' }
  })

  return { comments, isLocked }
}

export async function postChallengeComment(challengeId: string, content: string) {
  const session = await getServerSession(authOptions)
  if (!session) return { error: "Unauthorized" }

  const userId = session.user.id
  const role = session.user.role

  // Verify access again
  if (role === 'USER') {
    const submission = await prisma.challengeSubmission.findFirst({
        where: { userId, challengeId }
    })
    if (!submission) return { error: "Lesaikan tantangan dulu minimal 1x!" }
  }

  try {
    await prisma.challengeComment.create({
        data: {
            challengeId,
            userId,
            content,
            isHint: role !== 'USER' // Admin/Mentor posts are hints
        }
    })
    revalidatePath(`/dashboard/challenges/${challengeId}`)
    return { success: true }
  } catch (error) {
    return { error: "Gagal mengirim komentar." }
  }
}
