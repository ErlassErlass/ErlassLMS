'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

// --- Question Bank Actions ---

export async function createQuestionBank(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'SUPERADMIN') return { error: "Unauthorized" }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string
  const difficulty = formData.get('difficulty') as string

  try {
    const bank = await prisma.questionBank.create({
      data: {
        title,
        description,
        category,
        difficulty,
        createdById: session.user.id
      }
    })
    
    revalidatePath('/dashboard/admin/question-banks')
    return { success: true, bankId: bank.id }
  } catch (error) {
    console.error(error)
    return { error: "Failed to create question bank" }
  }
}

export async function updateQuestionBank(bankId: string, formData: FormData) {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'SUPERADMIN') return { error: "Unauthorized" }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  
  try {
    await prisma.questionBank.update({
      where: { id: bankId },
      data: {
        title,
        description
      }
    })

    revalidatePath(`/dashboard/admin/question-banks/${bankId}`)
    return { success: true }
  } catch (error) {
    return { error: "Failed to update question bank" }
  }
}

export async function deleteQuestionBank(bankId: string) {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'SUPERADMIN') return { error: "Unauthorized" }

  try {
    await prisma.questionBank.delete({ where: { id: bankId } })
    revalidatePath('/dashboard/admin/question-banks')
    return { success: true }
  } catch (error) {
    return { error: "Failed to delete question bank" }
  }
}

// --- Question Actions ---

export async function createQuestion(bankId: string, formData: FormData) {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'SUPERADMIN') return { error: "Unauthorized" }

  const questionText = formData.get('questionText') as string
  const questionType = formData.get('questionType') as string
  const points = parseInt(formData.get('points') as string) || 10
  const explanation = formData.get('explanation') as string
  const mediaUrl = formData.get('mediaUrl') as string
  const mediaType = formData.get('mediaType') as string
  
  // Handle Options based on type
  let options: { id: string; text: string }[] = []
  let correctAnswer = ''

  if (questionType === 'MULTIPLE_CHOICE') {
    const optionA = formData.get('optionA') as string
    const optionB = formData.get('optionB') as string
    const optionC = formData.get('optionC') as string
    const optionD = formData.get('optionD') as string
    
    options = [
      { id: 'A', text: optionA },
      { id: 'B', text: optionB },
      { id: 'C', text: optionC },
      { id: 'D', text: optionD }
    ]
    correctAnswer = formData.get('correctAnswer') as string // Should be 'A', 'B', 'C', or 'D'
  } else if (questionType === 'TRUE_FALSE') {
    options = [
      { id: 'true', text: 'Benar' },
      { id: 'false', text: 'Salah' }
    ]
    correctAnswer = formData.get('correctAnswer') as string // 'true' or 'false'
  }

  try {
    await prisma.question.create({
      data: {
        questionBankId: bankId,
        questionText,
        questionType,
        points,
        explanation,
        mediaUrl: mediaUrl || undefined,
        mediaType: mediaType || undefined,
        options: options, // Storing as JSON
        correctAnswer
      }
    })

    revalidatePath(`/dashboard/admin/question-banks/${bankId}`)
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to create question" }
  }
}

export async function deleteQuestion(questionId: string, bankId: string) {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'SUPERADMIN') return { error: "Unauthorized" }

  try {
    await prisma.question.delete({ where: { id: questionId } })
    revalidatePath(`/dashboard/admin/question-banks/${bankId}`)
    return { success: true }
  } catch (error) {
    return { error: "Failed to delete question" }
  }
}
