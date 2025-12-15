'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { uploadImage } from "@/lib/upload"

export async function createBadge(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'SUPERADMIN') return { error: "Unauthorized" }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string
  const xpReward = parseInt(formData.get('xpReward') as string) || 0
  const criteriaType = formData.get('criteriaType') as string
  const criteriaValue = formData.get('criteriaValue') as string
  
  const imageFile = formData.get('imageFile') as File
  let imageUrl = "🏆" // Default fallback

  if (imageFile && imageFile.size > 0) {
      const uploadedUrl = await uploadImage(imageFile, 'badges')
      if (uploadedUrl) imageUrl = uploadedUrl
  } else {
      const textIcon = formData.get('imageUrlText') as string
      if (textIcon) imageUrl = textIcon
  }

  const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Math.floor(Math.random() * 1000)

  try {
    await prisma.badge.create({
      data: {
        slug,
        name,
        description,
        imageUrl,
        category,
        xpReward,
        criteriaType,
        criteriaValue
      }
    })
    revalidatePath('/dashboard/admin/badges')
    return { success: true }
  } catch (error) {
    console.error('Create badge error:', error)
    return { error: "Failed to create badge" }
  }
}

export async function updateBadge(id: string, formData: FormData) {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'SUPERADMIN') return { error: "Unauthorized" }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string
  const xpReward = parseInt(formData.get('xpReward') as string) || 0
  const criteriaType = formData.get('criteriaType') as string
  const criteriaValue = formData.get('criteriaValue') as string

  const imageFile = formData.get('imageFile') as File
  let imageUrl = formData.get('currentImageUrl') as string

  if (imageFile && imageFile.size > 0) {
      const uploadedUrl = await uploadImage(imageFile, 'badges')
      if (uploadedUrl) imageUrl = uploadedUrl
  } else {
      const textIcon = formData.get('imageUrlText') as string
      if (textIcon && textIcon !== imageUrl) imageUrl = textIcon
  }

  try {
    await prisma.badge.update({
      where: { id },
      data: {
        name,
        description,
        imageUrl,
        category,
        xpReward,
        criteriaType,
        criteriaValue
      }
    })
    revalidatePath('/dashboard/admin/badges')
    return { success: true }
  } catch (error) {
    console.error('Update badge error:', error)
    return { error: "Failed to update badge" }
  }
}

export async function deleteBadge(id: string) {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'SUPERADMIN') return { error: "Unauthorized" }

  try {
    await prisma.badge.delete({ where: { id } })
    revalidatePath('/dashboard/admin/badges')
    return { success: true }
  } catch (error) {
    return { error: "Failed to delete badge" }
  }
}
