'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { generateId } from "@/lib/id-generator"

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
    try {
        const today = getToday()
        
        // 1. Get User Data (Raw query due to client sync issues)
        const users: any[] = await prisma.$queryRaw`SELECT * FROM users WHERE id = ${userId}`
        const user = users[0]
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
        } else if (lastLogin.getTime() === getYesterday().getTime()) {
            // Login consecutive day
            newStreak += 1
            shouldUpdate = true
        } else if (lastLogin.getTime() < getYesterday().getTime()) {
            // Missed a day
            // Check Freeze? (Simplified: Just reset for now unless requested)
            if (lastLogin.getTime() !== today.getTime()) {
                newStreak = 1
                shouldUpdate = true
            }
        }

        if (shouldUpdate || !lastLogin || lastLogin.getTime() !== today.getTime()) {
            await prisma.$executeRaw`
                UPDATE users 
                SET "currentStreak" = ${newStreak}, "lastLoginDate" = NOW() 
                WHERE id = ${userId}
            `
        }

        // 3. Generate Daily Quests
        const quests: any[] = await prisma.$queryRaw`
            SELECT * FROM daily_quests 
            WHERE "userId" = ${userId} AND date = ${today}
        `
        
        if (quests.length === 0) {
            // Create default quests
            const newQuests = [
                { type: 'LOGIN', desc: 'Login hari ini', target: 1, xp: 20 },
                { type: 'READ_MATERIAL', desc: 'Baca 1 materi pelajaran', target: 1, xp: 50 },
                { type: 'COMPLETE_QUIZ', desc: 'Selesaikan 1 kuis dengan nilai sempurna', target: 1, xp: 100 }
            ]

            for (const q of newQuests) {
                const qId = generateId('badge') // re-using id gen
                await prisma.$executeRaw`
                    INSERT INTO daily_quests (id, "userId", date, type, description, target, progress, "isClaimed", "xpReward")
                    VALUES (${qId}, ${userId}, ${today}, ${q.type}, ${q.desc}, ${q.target}, ${q.type === 'LOGIN' ? 1 : 0}, false, ${q.xp})
                `
            }
        }
        
        // revalidatePath('/dashboard') // Removed to prevent "revalidatePath during render" error
        return { success: true, streak: newStreak }
    } catch (e) {
        console.error("Daily Login Check Error:", e)
    }
}

export async function getDailyQuests(userId: string) {
    const today = getToday()
    const quests: any[] = await prisma.$queryRaw`
        SELECT * FROM daily_quests 
        WHERE "userId" = ${userId} AND date = ${today}
        ORDER BY "xpReward" ASC
    `
    return quests
}

export async function claimQuest(questId: string) {
    const session = await getServerSession(authOptions)
    if (!session) return { error: "Unauthorized" }
    
    try {
        const quests: any[] = await prisma.$queryRaw`SELECT * FROM daily_quests WHERE id = ${questId}`
        const quest = quests[0]
        
        if (!quest) return { error: "Quest not found" }
        if (quest.isClaimed) return { error: "Already claimed" }
        if (quest.progress < quest.target) return { error: "Quest not completed" }

        // Give Reward
        await prisma.$executeRaw`UPDATE users SET xp = xp + ${quest.xpReward} WHERE id = ${session.user.id}`
        
        // Mark Claimed
        await prisma.$executeRaw`UPDATE daily_quests SET "isClaimed" = true WHERE id = ${questId}`

        revalidatePath('/dashboard')
        return { success: true, message: `Berhasil klaim ${quest.xpReward} XP!` }
    } catch (e) {
        return { error: "Gagal klaim reward" }
    }
}
