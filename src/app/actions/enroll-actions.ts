'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function enrollCourse(courseId: string) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return { success: false, message: "Harap login terlebih dahulu" }
  }

  const userId = session.user.id

  try {
    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      }
    })

    if (existingEnrollment) {
      return { success: true, message: "Sudah terdaftar" }
    }

    // Create enrollment
    await prisma.enrollment.create({
      data: {
        userId,
        courseId,
        status: 'ENROLLED',
        progressPercentage: 0
      }
    })

    revalidatePath(`/dashboard/courses/${courseId}`)
    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (error) {
    console.error("Enrollment error:", error)
    return { success: false, message: "Gagal mendaftar kursus" }
  }
}
