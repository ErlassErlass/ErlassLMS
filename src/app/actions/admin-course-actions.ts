'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { uploadImage } from "@/lib/upload"

// --- Course Actions ---

export async function createCourse(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'SUPERADMIN') return { error: "Unauthorized" }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string
  const categoryId = formData.get('categoryId') as string
  const level = formData.get('level') as string
  const price = parseFloat(formData.get('price') as string) || 0
  const isPremium = formData.get('isPremium') === 'on'
  
  const coverImageFile = formData.get('coverImageFile') as File
  
  let coverImage = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60" // Default

  if (coverImageFile && coverImageFile.size > 0) {
      const uploadedUrl = await uploadImage(coverImageFile)
      if (uploadedUrl) coverImage = uploadedUrl
  } else {
    const existingUrl = formData.get('coverImage') as string
    if (existingUrl) coverImage = existingUrl
  }
  
  try {
    const course = await prisma.course.create({
      data: {
        title,
        description,
        category: category || 'Uncategorized',
        categoryId: categoryId || undefined,
        level: level || 'Beginner',
        price,
        isPremium,
        coverImage,
        createdById: session.user.id,
        isPublished: true // Default to published for now
      }
    })
    
    revalidatePath('/dashboard/admin/courses')
    return { success: true, courseId: course.id }
  } catch (error) {
    console.error("Create course error:", error)
    return { error: "Failed to create course" }
  }
}

export async function updateCourse(courseId: string, formData: FormData) {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'SUPERADMIN') return { error: "Unauthorized" }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string
  const categoryId = formData.get('categoryId') as string
  const level = formData.get('level') as string
  const price = parseFloat(formData.get('price') as string) || 0
  const isPremium = formData.get('isPremium') === 'on'

  const coverImageFile = formData.get('coverImageFile') as File
  let coverImage = formData.get('coverImage') as string // Existing URL if not changed

  if (coverImageFile && coverImageFile.size > 0) {
      const uploadedUrl = await uploadImage(coverImageFile)
      if (uploadedUrl) coverImage = uploadedUrl
  }

  try {
    await prisma.course.update({
      where: { id: courseId },
      data: {
        title,
        description,
        category,
        categoryId: categoryId || undefined,
        level,
        price,
        isPremium,
        coverImage: coverImage || undefined
      }
    })
    
    revalidatePath('/dashboard/admin/courses')
    revalidatePath(`/dashboard/admin/courses/${courseId}`)
    return { success: true }
  } catch (error) {
    console.error("Update course error:", error)
    return { error: "Failed to update course" }
  }
}

export async function deleteCourse(courseId: string) {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'SUPERADMIN') return { error: "Unauthorized" }

  try {
    await prisma.course.delete({ where: { id: courseId } })
    revalidatePath('/dashboard/admin/courses')
    return { success: true }
  } catch (error) {
    return { error: "Failed to delete course" }
  }
}

// --- Section Actions ---

export async function createSection(courseId: string, formData: FormData) {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'SUPERADMIN') return { error: "Unauthorized" }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const content = formData.get('content') as string
  const videoUrl = formData.get('videoUrl') as string
  const orderIndex = parseInt(formData.get('orderIndex') as string) || 0
  const isFree = formData.get('isFree') === 'on'

  try {
    await prisma.courseSection.create({
      data: {
        courseId,
        title,
        description,
        content,
        videoUrl,
        orderIndex,
        isFree,
        estimatedDuration: 15 // Default duration
      }
    })

    // Update total sections count in course
    const count = await prisma.courseSection.count({ where: { courseId } })
    await prisma.course.update({ where: { id: courseId }, data: { totalSections: count }})

    revalidatePath(`/dashboard/admin/courses/${courseId}`)
    return { success: true }
  } catch (error) {
    return { error: "Failed to create section" }
  }
}

export async function updateSection(sectionId: string, formData: FormData) {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'SUPERADMIN') return { error: "Unauthorized" }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const content = formData.get('content') as string
  const videoUrl = formData.get('videoUrl') as string
  const isFree = formData.get('isFree') === 'on'
  // const orderIndex = parseInt(formData.get('orderIndex') as string)

  try {
    const section = await prisma.courseSection.update({
      where: { id: sectionId },
      data: {
        title,
        description,
        content,
        videoUrl,
        isFree
      }
    })

    revalidatePath(`/dashboard/admin/courses/${section.courseId}`)
    return { success: true }
  } catch (error) {
    return { error: "Failed to update section" }
  }
}

export async function deleteSection(sectionId: string, courseId: string) {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'SUPERADMIN') return { error: "Unauthorized" }

  try {
    await prisma.courseSection.delete({ where: { id: sectionId } })
    
    // Update total sections count in course
    const count = await prisma.courseSection.count({ where: { courseId } })
    await prisma.course.update({ where: { id: courseId }, data: { totalSections: count }})

    revalidatePath(`/dashboard/admin/courses/${courseId}`)
    return { success: true }
  } catch (error) {
    return { error: "Failed to delete section" }
  }
}
