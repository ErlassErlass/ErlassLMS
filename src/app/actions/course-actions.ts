'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

import { GamificationService } from "@/lib/services/gamification-service"

export async function markSectionComplete(courseId: string, sectionId: string) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return { success: false, message: "Unauthorized" }
  }

  try {
    const userId = session.user.id

    // Check if already completed to prevent duplicate XP
    const existingProgress = await prisma.userProgress.findUnique({
      where: {
        userId_sectionId: {
          userId,
          sectionId
        }
      }
    })

    let xpAwarded = 0
    let levelUp = false
    let newBadges: any[] = []

    if (!existingProgress?.completed) {
        // Award XP for Section Completion (e.g., 10 XP)
        const xpResult = await GamificationService.awardXP(userId, 10, "Section Complete")
        if (xpResult) {
            xpAwarded = xpResult.xpGained
            levelUp = xpResult.leveledUp
        }
    }

    // 1. Upsert UserProgress
    await prisma.userProgress.upsert({
      where: {
        userId_sectionId: {
          userId,
          sectionId
        }
      },
      update: {
        completed: true,
        completedAt: new Date()
      },
      create: {
        userId,
        sectionId,
        courseId,
        completed: true,
        completedAt: new Date()
      }
    })

    // 2. Update Enrollment Progress
    // Count total sections
    const totalSections = await prisma.courseSection.count({
      where: { courseId }
    })

    // Count completed sections
    const completedSections = await prisma.userProgress.count({
      where: {
        userId,
        courseId,
        completed: true
      }
    })

    // Calculate percentage
    const progressPercentage = totalSections > 0 
      ? (completedSections / totalSections) * 100 
      : 0

    const isCourseCompleted = progressPercentage === 100

    // Update enrollment
    await prisma.enrollment.update({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      },
      data: {
        progressPercentage,
        currentSectionId: sectionId,
        completedAt: isCourseCompleted ? new Date() : null,
        status: isCourseCompleted ? 'COMPLETED' : 'ENROLLED'
      }
    })

    // Check for Course Completion Badges/XP
    if (isCourseCompleted) {
        // Bonus XP for Course Completion (e.g., 100 XP)
        const xpResult = await GamificationService.awardXP(userId, 100, "Course Complete")
        if (xpResult) {
            xpAwarded += xpResult.xpGained
            levelUp = levelUp || xpResult.leveledUp
        }

        // Check for Badges
        const courseBadges = await GamificationService.checkAndAwardBadges(userId, { type: 'COURSE_COMPLETE', id: courseId })
        newBadges = [...newBadges, ...courseBadges]
    }

    revalidatePath(`/dashboard/courses/${courseId}`)
    revalidatePath('/dashboard')

    return { success: true, progress: progressPercentage, xpAwarded, levelUp, newBadges }
  } catch (error) {
    console.error("Progress update error:", error)
    return { success: false, message: "Internal Server Error" }
  }
}
