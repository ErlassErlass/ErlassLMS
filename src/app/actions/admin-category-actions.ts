'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function createCategory(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'SUPERADMIN') return { error: "Unauthorized" }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')

  try {
    await prisma.courseCategory.create({
      data: {
        name,
        slug,
        description
      }
    })
    
    revalidatePath('/dashboard/admin/categories')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to create category" }
  }
}

export async function updateCategory(id: string, formData: FormData) {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'SUPERADMIN') return { error: "Unauthorized" }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  // Update slug automatically if name changes, or keep existing? 
  // Usually better to keep slug stable for SEO, or optional update. 
  // Let's update slug for now to match name.
  const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')

  try {
    await prisma.courseCategory.update({
      where: { id },
      data: {
        name,
        slug,
        description
      }
    })
    
    revalidatePath('/dashboard/admin/categories')
    return { success: true }
  } catch (error) {
    return { error: "Failed to update category" }
  }
}

export async function deleteCategory(id: string) {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'SUPERADMIN') return { error: "Unauthorized" }

  try {
    await prisma.courseCategory.delete({ where: { id } })
    revalidatePath('/dashboard/admin/categories')
    return { success: true }
  } catch (error) {
    return { error: "Failed to delete category" }
  }
}
