'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

import { GamificationService } from "@/lib/services/gamification-service"

export async function submitChallenge(challengeId: string, code: string, isWebPassed?: boolean) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return { success: false, message: "Unauthorized" }
  }

  try {
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId }
    })

    if (!challenge) {
      return { success: false, message: "Challenge not found" }
    }

    // Mock Evaluation Logic
    let passed = false
    let output = ""

    const mode = challenge.category.toLowerCase()
    const isWeb = mode.includes('web') || mode.includes('html')

    if (isWeb) {
        passed = !!isWebPassed
        output = passed ? "HTML Validation Passed" : "HTML Validation Failed"
    } else {
        // Python Logic (Simple Mock)
        if (code.trim().length > 20) {
            passed = true
            output = `Running code...\n\nOutput:\n${challenge.expectedOutput}\n\n[SUCCESS] Output matches expected result!`
        } else {
            passed = false
            output = `Running code...\n\nError: Code is too short or incomplete.\n\n[FAIL] Expected output not met.`
        }
    }

    // Save Submission
    const submission = await prisma.challengeSubmission.create({
      data: {
        userId: session.user.id,
        challengeId: challenge.id,
        code: code,
        result: output,
        passed: passed,
        attemptNumber: 1
      }
    })

    // Gamification Logic
    let earnedXp = 0
    let newBadges: any[] = []
    let levelUp = false

    if (passed) {
      const existingPass = await prisma.challengeSubmission.findFirst({
        where: {
          userId: session.user.id,
          challengeId: challenge.id,
          passed: true,
          id: { not: submission.id }
        }
      })

      if (!existingPass) {
        // Award XP
        const xpResult = await GamificationService.awardXP(session.user.id, challenge.points, `Challenge: ${challenge.title}`)
        if (xpResult) {
            earnedXp = xpResult.xpGained
            levelUp = xpResult.leveledUp
        }

        // Check Badges
        newBadges = await GamificationService.checkAndAwardBadges(session.user.id, { type: 'CHALLENGE_COMPLETE' })
      }
    }

    revalidatePath(`/dashboard/challenges/${challengeId}`)
    revalidatePath('/dashboard')

    return { 
        success: true, 
        passed: passed, 
        output: output,
        message: passed ? "Selamat! Jawaban kamu benar." : "Yah, jawaban masih kurang tepat.",
        earnedXp,
        newBadges,
        levelUp
    }

  } catch (error) {
    console.error("Submission error:", error)
    return { success: false, message: "Internal Server Error" }
  }
}
