'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { generateId } from "@/lib/id-generator"
import { revalidatePath } from "next/cache"

export async function checkCanSpin() {
  const session = await getServerSession(authOptions)
  if (!session) return { canSpin: false }

  const userId = session.user.id
  
  // Check spin logs for today
  const startOfDay = new Date()
  startOfDay.setHours(0,0,0,0)
  
  // Use Raw Query to avoid Prisma Client sync issues
  const logs: any[] = await prisma.$queryRaw`
    SELECT id FROM spin_logs 
    WHERE "userId" = ${userId} 
    AND "createdAt" >= ${startOfDay}
    LIMIT 1
  `

  return { canSpin: logs.length === 0 }
}

export async function performSpin() {
  const session = await getServerSession(authOptions)
  if (!session) return { error: "Unauthorized" }

  const userId = session.user.id
  
  // 1. Double check eligibility
  const { canSpin } = await checkCanSpin()
  if (!canSpin) return { error: "Jatah spin harian sudah habis!" }

  // 2. Determine Reward (Weighted Probability)
  const rand = Math.random() * 100 // 0 - 100
  let rewardType = 'ZONK'
  let rewardValue = 0
  let message = "Coba lagi besok!"

  if (rand < 50) {
    // 50% chance: Small XP
    rewardType = 'XP'
    rewardValue = Math.floor(Math.random() * 40) + 10 // 10-50 XP
    message = `Selamat! Kamu dapat ${rewardValue} XP`
  } else if (rand < 80) {
    // 30% chance: Big XP
    rewardType = 'XP'
    rewardValue = Math.floor(Math.random() * 50) + 50 // 50-100 XP
    message = `Wow! Kamu dapat ${rewardValue} XP`
  } else if (rand < 95) {
    // 15% chance: ZONK
    rewardType = 'ZONK'
    rewardValue = 0
    message = "Sayang sekali, belum beruntung. Semangat!"
  } else {
    // 5% chance: Voucher
    rewardType = 'VOUCHER'
    rewardValue = 10 // 10% discount
    message = "JACKPOT! Voucher Diskon 10%"
  }

  try {
    // 3. Process Reward
    if (rewardType === 'XP') {
        await prisma.$executeRaw`UPDATE users SET xp = xp + ${rewardValue} WHERE id = ${userId}`
    } else if (rewardType === 'VOUCHER') {
        // Create a unique voucher for user
        const code = `SPIN-${generateId('voucher').substring(0, 6).toUpperCase()}`
        await prisma.voucher.create({
            data: {
                id: generateId('voucher'),
                code,
                discountType: 'PERCENTAGE',
                discountValue: rewardValue,
                description: 'Hadiah Daily Spin',
                maxUsage: 1,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
            }
        })
        message += ` (Kode: ${code})`
    }

    // 4. Log Spin
    const logId = generateId('badge')
    await prisma.$executeRaw`
        INSERT INTO spin_logs (id, "userId", "rewardType", "rewardValue", "createdAt")
        VALUES (${logId}, ${userId}, ${rewardType}, ${rewardValue}, NOW())
    `

    revalidatePath('/dashboard/shop') // Refresh UI if needed
    return { success: true, rewardType, rewardValue, message }

  } catch (error) {
    console.error("Spin Error:", error)
    return { error: "Gagal memproses spin." }
  }
}
