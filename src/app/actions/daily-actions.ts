'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

// Helper to get midnight date
const getToday = () => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
}

const getYesterday = () => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    d.setHours(0, 0, 0, 0)
    return d
}

export async function checkDailyLogin(userId: string) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.id !== userId) return { error: "Unauthorized" }

    try {
        const today = getToday()
        const yesterday = getYesterday()
        
        // 1. Get User Data
        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (!user) return

        const lastLogin = user.lastLoginDate ? new Date(user.lastLoginDate) : null
        if (lastLogin) lastLogin.setHours(0,0,0,0) // Normalize

        // 2. Logic Streak
        let newStreak = user.currentStreak
        let shouldUpdate = false

        if (!lastLogin) {
            // First time ever
            newStreak = 1
            shouldUpdate = true
        } else if (lastLogin.getTime() === yesterday.getTime()) {
            // Login consecutive day
            newStreak += 1
            shouldUpdate = true
        } else if (lastLogin.getTime() < yesterday.getTime()) {
            // Missed a day
            // If last login was NOT today (already handled above), reset.
            if (lastLogin.getTime() !== today.getTime()) {
                newStreak = 1
                shouldUpdate = true
            }
        }

        if (shouldUpdate || !lastLogin || lastLogin.getTime() !== today.getTime()) {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    currentStreak: newStreak,
                    lastLoginDate: new Date()
                }
            })
        }

        // 3. Generate Daily Quests
        // Use date range to ensure we catch any quests for today regardless of time (though we store as 00:00)
        const startOfDay = new Date(today)
        startOfDay.setHours(0, 0, 0, 0)
        
        const endOfDay = new Date(today)
        endOfDay.setHours(23, 59, 59, 999)

        const quests = await prisma.dailyQuest.findMany({
            where: {
                userId: userId,
                date: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            }
        })
        
        if (quests.length === 0) {
            // Create default quests
            const newQuests = [
                { type: 'LOGIN', desc: 'Login hari ini', target: 1, xp: 20 },
                { type: 'READ_MATERIAL', desc: 'Baca 1 materi pelajaran', target: 1, xp: 50 },
                { type: 'COMPLETE_QUIZ', desc: 'Selesaikan 1 kuis dengan nilai sempurna', target: 1, xp: 100 }
            ]

            // Use createMany for efficiency if supported, or loop
            for (const q of newQuests) {
                await prisma.dailyQuest.create({
                    data: {
                        userId: userId,
                        date: today,
                        type: q.type,
                        description: q.desc,
                        target: q.target,
                        progress: q.type === 'LOGIN' ? 1 : 0, // Auto complete login quest
                        isClaimed: false,
                        xpReward: q.xp
                    }
                })
            }
        }
        
        return { success: true, streak: newStreak }
    } catch (e) {
        console.error("Daily Login Check Error:", e)
    }
}

export async function getDailyQuests(userId: string) {
    const today = getToday()
    const startOfDay = new Date(today)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(today)
    endOfDay.setHours(23, 59, 59, 999)

    const quests = await prisma.dailyQuest.findMany({
        where: {
            userId: userId,
            date: {
                gte: startOfDay,
                lte: endOfDay
            }
        },
        orderBy: {
            xpReward: 'asc'
        }
    })
    return quests
}

export async function claimQuest(questId: string) {
    const session = await getServerSession(authOptions)
    if (!session) return { error: "Unauthorized" }
    
    try {
        const quest = await prisma.dailyQuest.findUnique({ where: { id: questId } })
        
        if (!quest) return { error: "Quest not found" }
        if (quest.isClaimed) return { error: "Already claimed" }
        if (quest.progress < quest.target) return { error: "Quest not completed" }

        // Give Reward
        await prisma.user.update({
            where: { id: session.user.id },
            data: { xp: { increment: quest.xpReward } }
        })
        
        // Mark Claimed
        await prisma.dailyQuest.update({
            where: { id: questId },
            data: { isClaimed: true }
        })

        revalidatePath('/dashboard')
        return { success: true, message: `Berhasil klaim ${quest.xpReward} XP!` }
    } catch (e) {
        return { error: "Gagal klaim reward" }
    }
}
