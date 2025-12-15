'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

interface BulkCourseData {
  title: string
  description?: string
  category: string
  level: string
  price?: number
  sections: {
    title: string
    description?: string
    content?: string
    videoUrl?: string
    orderIndex: number
  }[]
}

export async function importCourses(jsonString: string) {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'SUPERADMIN') return { error: "Unauthorized" }

  try {
    const data: BulkCourseData[] = JSON.parse(jsonString)
    
    if (!Array.isArray(data)) {
        return { error: "Invalid Format: Root must be an array of courses" }
    }

    let createdCount = 0

    for (const courseData of data) {
      // Validate basic fields
      if (!courseData.title || !courseData.category) continue

      await prisma.course.create({
        data: {
          title: courseData.title,
          description: courseData.description || "",
          category: courseData.category,
          level: courseData.level || "Beginner",
          price: courseData.price || 0,
          isPremium: (courseData.price || 0) > 0,
          createdById: session.user.id,
          isPublished: false, // Draft by default
          totalSections: courseData.sections ? courseData.sections.length : 0,
          sections: {
            create: courseData.sections?.map((section, index) => ({
                title: section.title,
                description: section.description || "",
                content: section.content || "",
                videoUrl: section.videoUrl || "",
                orderIndex: section.orderIndex ?? index,
                isFree: index === 0 // First section free by default
            }))
          }
        }
      })
      createdCount++
    }
    
    revalidatePath('/dashboard/admin/courses')
    return { success: true, count: createdCount }
  } catch (error) {
    console.error("Import error:", error)
    return { error: "Failed to import courses. Please check JSON format." }
  }
}
