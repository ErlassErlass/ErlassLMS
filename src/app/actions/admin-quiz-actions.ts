'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

// --- Quiz Management ---

export async function createQuiz(sectionId: string, formData: FormData) {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'SUPERADMIN') return { error: "Unauthorized" }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const duration = parseInt(formData.get('duration') as string) || 0
  const courseId = formData.get('courseId') as string

  try {
    const quiz = await prisma.quiz.create({
      data: {
        sectionId,
        courseId,
        title,
        description,
        duration
      }
    })
    
    revalidatePath(`/dashboard/admin/courses/${courseId}`)
    return { success: true, quizId: quiz.id }
  } catch (error) {
    return { error: "Failed to create quiz" }
  }
}

export async function deleteQuiz(quizId: string, courseId: string) {
    const session = await getServerSession(authOptions)
    if (session?.user.role !== 'SUPERADMIN') return { error: "Unauthorized" }

    try {
        await prisma.quiz.delete({ where: { id: quizId } })
        revalidatePath(`/dashboard/admin/courses/${courseId}`)
        return { success: true }
    } catch (error) {
        return { error: "Failed to delete quiz" }
    }
}

export async function updateQuiz(quizId: string, formData: FormData) {
    const session = await getServerSession(authOptions)
    if (session?.user.role !== 'SUPERADMIN') return { error: "Unauthorized" }

    const title = formData.get('title') as string
    const duration = parseInt(formData.get('duration') as string) || 0
    const maxAttempts = parseInt(formData.get('maxAttempts') as string) || 1

    try {
        await prisma.quiz.update({
            where: { id: quizId },
            data: { title, duration, maxAttempts }
        })
        revalidatePath('/dashboard/admin/courses')
        return { success: true }
    } catch (error) {
        return { error: "Failed to update quiz" }
    }
}

// --- Quiz Question Management (Import from Bank) ---

export async function importQuestionsFromBank(quizId: string, bankId: string, count: number) {
    const session = await getServerSession(authOptions)
    if (session?.user.role !== 'SUPERADMIN') return { error: "Unauthorized" }

    try {
        // 1. Get random questions from bank
        // Prisma doesn't have native random, so we fetch all IDs and pick random
        const allQuestions = await prisma.question.findMany({
            where: { questionBankId: bankId },
            select: { id: true }
        })

        if (allQuestions.length === 0) return { error: "Bank is empty" }

        // Shuffle and pick N
        const shuffled = allQuestions.sort(() => 0.5 - Math.random())
        const selected = shuffled.slice(0, count)

        // 2. Get current max order in quiz
        const lastQ = await prisma.quizQuestion.findFirst({
            where: { quizId },
            orderBy: { order: 'desc' }
        })
        let currentOrder = (lastQ?.order || 0) + 1

        // 3. Add to QuizQuestion
        await prisma.$transaction(
            selected.map(q => prisma.quizQuestion.create({
                data: {
                    quizId,
                    questionId: q.id,
                    order: currentOrder++
                }
            }))
        )

        revalidatePath(`/dashboard/admin/quizzes/${quizId}`) // We will make this page
        return { success: true, count: selected.length }

    } catch (error) {
        console.error(error)
        return { error: "Failed to import questions" }
    }
}

export async function removeQuestionFromQuiz(quizQuestionId: string) {
    const session = await getServerSession(authOptions)
    if (session?.user.role !== 'SUPERADMIN') return { error: "Unauthorized" }

    try {
        await prisma.quizQuestion.delete({ where: { id: quizQuestionId } })
        return { success: true }
    } catch (error) {
        return { error: "Failed to remove question" }
    }
}
