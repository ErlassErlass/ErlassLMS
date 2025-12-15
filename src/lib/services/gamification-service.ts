
import { prisma } from "@/lib/db"

// Level Config
const LEVEL_CURVE_CONSTANT = 100

export class GamificationService {
  
  static calculateLevel(xp: number): number {
    return Math.floor(Math.sqrt(xp / LEVEL_CURVE_CONSTANT)) + 1
  }

  static calculateLevelProgress(xp: number): { currentLevelXp: number, nextLevelXp: number, percent: number } {
    const level = this.calculateLevel(xp)
    const currentLevelBaseXp = Math.pow(level - 1, 2) * LEVEL_CURVE_CONSTANT
    const nextLevelBaseXp = Math.pow(level, 2) * LEVEL_CURVE_CONSTANT
    
    const xpInCurrentLevel = xp - currentLevelBaseXp
    const xpRequiredForNextLevel = nextLevelBaseXp - currentLevelBaseXp
    
    const percent = Math.min(100, Math.floor((xpInCurrentLevel / xpRequiredForNextLevel) * 100))
    
    return {
      currentLevelXp: xpInCurrentLevel,
      nextLevelXp: nextLevelBaseXp,
      percent
    }
  }

  static async awardXP(userId: string, amount: number, source: string) {
    if (amount <= 0) return null

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) return null

    const newXP = user.xp + amount
    const oldLevel = user.level
    const newLevel = this.calculateLevel(newXP)

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        xp: newXP,
        level: newLevel
      }
    })

    // Check XP Badges immediately
    await this.checkAndAwardBadges(userId, { type: 'XP_EARNED' })

    const leveledUp = newLevel > oldLevel

    return {
      newXP,
      newLevel,
      leveledUp,
      xpGained: amount
    }
  }

  static async checkAndAwardBadges(userId: string, context: { type: 'COURSE_COMPLETE' | 'CHALLENGE_COMPLETE' | 'STREAK' | 'XP_EARNED', id?: string }) {
    const newBadges = []
    
    const user = await prisma.user.findUnique({ 
        where: { id: userId },
        include: { badges: { select: { badgeId: true } } }
    })
    
    if (!user) return []

    const ownedBadgeIds = new Set(user.badges.map(b => b.badgeId))

    // Determine which criteria types are relevant for this event
    const criteriaTypes = ['XP_MILESTONE'] // Always check XP
    if (context.type === 'COURSE_COMPLETE') criteriaTypes.push('COURSE_COMPLETION')
    if (context.type === 'CHALLENGE_COMPLETE') criteriaTypes.push('CHALLENGE_COUNT')
    
    // Fetch potential badges
    const candidates = await prisma.badge.findMany({
        where: {
            criteriaType: { in: criteriaTypes }
        }
    })

    for (const badge of candidates) {
        if (ownedBadgeIds.has(badge.id)) continue

        const isMet = await this.evaluateCriteria(userId, user, badge, context)
        
        if (isMet) {
            await this.awardBadgeToUser(userId, badge)
            newBadges.push(badge)
        }
    }

    return newBadges
  }

  private static async evaluateCriteria(userId: string, user: any, badge: any, context: any): Promise<boolean> {
      switch (badge.criteriaType) {
          case 'COURSE_COMPLETION':
              // Requires context ID to match the criteria value (Course ID)
              return context.type === 'COURSE_COMPLETE' && badge.criteriaValue === context.id
          
          case 'CHALLENGE_COUNT':
              if (context.type !== 'CHALLENGE_COMPLETE') return false
              const count = await prisma.challengeSubmission.count({ 
                  where: { userId, passed: true } 
              })
              return count >= parseInt(badge.criteriaValue || '0')

          case 'XP_MILESTONE':
              return user.xp >= parseInt(badge.criteriaValue || '0')
              
          default:
              return false
      }
  }

  private static async awardBadgeToUser(userId: string, badge: any) {
       try {
           await prisma.userBadge.create({
              data: { userId, badgeId: badge.id }
           })
           
           if (badge.xpReward > 0) {
               // Award XP but DO NOT trigger another badge check recursively to prevent potential loops if badge award triggers XP badge
               // We call the direct update or use a flag in awardXP. 
               // For safety here: Just simple update
               await prisma.user.update({
                   where: { id: userId },
                   data: { xp: { increment: badge.xpReward } }
               })
           }
       } catch (error) {
           console.error(`Failed to award badge ${badge.id} to user ${userId}`, error)
       }
  }
}
