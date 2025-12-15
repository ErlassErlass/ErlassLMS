'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { GamificationService } from "@/lib/services/gamification-service"
import { revalidatePath } from "next/cache"

export async function unlockMysteryBadge(badgeSlug: string) {
  const session = await getServerSession(authOptions)
  if (!session) return { success: false }

  const userId = session.user.id

  // Find badge
  const badge = await prisma.badge.findUnique({
    where: { slug: badgeSlug }
  })

  if (!badge) return { success: false }

  // Check if already awarded
  const existing = await prisma.userBadge.findUnique({
    where: {
        userId_badgeId: {
            userId,
            badgeId: badge.id
        }
    }
  })

  if (existing) return { success: true, message: "Already unlocked" }

  // Award Badge
  await prisma.userBadge.create({
    data: {
        userId,
        badgeId: badge.id
    }
  })

  // Award XP if badge has reward
  if (badge.xpReward > 0) {
    await GamificationService.awardXP(userId, badge.xpReward, `Badge: ${badge.name}`)
  }

  revalidatePath('/dashboard')
  
  return { success: true, badgeName: badge.name, xp: badge.xpReward }
}
