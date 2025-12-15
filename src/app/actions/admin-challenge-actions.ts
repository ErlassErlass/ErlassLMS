'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function createChallenge(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'SUPERADMIN') return { error: "Unauthorized" }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string
  const difficulty = formData.get('difficulty') as string
  const points = parseInt(formData.get('points') as string) || 50
  const instructions = formData.get('instructions') as string
  const starterCode = formData.get('starterCode') as string
  const expectedOutput = formData.get('expectedOutput') as string
  const published = formData.get('published') === 'on'

  try {
    await prisma.challenge.create({
      data: {
        title,
        description,
        category,
        difficulty,
        points,
        instructions,
        starterCode,
        expectedOutput,
        published,
        publishedAt: published ? new Date() : null
      }
    })
    
    revalidatePath('/dashboard/admin/challenges')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to create challenge" }
  }
}

export async function updateChallenge(challengeId: string, formData: FormData) {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'SUPERADMIN') return { error: "Unauthorized" }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string
  const difficulty = formData.get('difficulty') as string
  const points = parseInt(formData.get('points') as string) || 50
  const instructions = formData.get('instructions') as string
  const starterCode = formData.get('starterCode') as string
  const expectedOutput = formData.get('expectedOutput') as string
  const published = formData.get('published') === 'on'

  try {
    await prisma.challenge.update({
      where: { id: challengeId },
      data: {
        title,
        description,
        category,
        difficulty,
        points,
        instructions,
        starterCode,
        expectedOutput,
        published,
        publishedAt: published ? new Date() : null
      }
    })

    revalidatePath('/dashboard/admin/challenges')
    return { success: true }
  } catch (error) {
    return { error: "Failed to update challenge" }
  }
}

export async function deleteChallenge(challengeId: string) {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'SUPERADMIN') return { error: "Unauthorized" }

  try {
    await prisma.challenge.delete({ where: { id: challengeId } })
    revalidatePath('/dashboard/admin/challenges')
    return { success: true }
  } catch (error) {
    return { error: "Failed to delete challenge" }
  }
}
