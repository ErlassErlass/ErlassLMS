'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { GamificationService } from "@/lib/services/gamification-service"
import { revalidatePath } from "next/cache"

export async function submitQuiz(quizId: string, userAnswers: Record<string, string>) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return { success: false, message: "Unauthorized" }
  }

  try {
    const userId = session.user.id

    // 1. Fetch Quiz Details (Questions & Correct Answers)
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: {
            question: true
          }
        },
        section: true // To link back to course/section
      }
    })

    if (!quiz) return { success: false, message: "Quiz not found" }

    // 2. Calculate Score
    let totalPoints = 0
    let earnedPoints = 0
    let correctCount = 0
    const results = []

    for (const qq of quiz.questions) {
      const question = qq.question
      const userAnswer = userAnswers[question.id]
      const isCorrect = userAnswer === question.correctAnswer
      
      totalPoints += question.points
      if (isCorrect) {
        earnedPoints += question.points
        correctCount++
      }

      results.push({
        questionId: question.id,
        isCorrect,
        correctAnswer: question.correctAnswer,
        userAnswer,
        explanation: question.explanation
      })
    }

    const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0
    const isPassed = score >= 70 // Passing grade 70%

    // 3. Save Attempt
    await prisma.quizAttempt.create({
      data: {
        userId,
        quizId,
        score,
        answers: userAnswers as any,
        completedAt: new Date()
      }
    })

    // 4. Award XP & Gamification (Only if passed and first time passing?)
    // For now, we award XP based on score every time (or maybe limit it?)
    // Let's limit: Check if user has passed this quiz before
    const previousAttempts = await prisma.quizAttempt.findMany({
        where: { userId, quizId, score: { gte: 70 } }
    })

    let xpAwarded = 0
    let newBadges: any[] = []

    if (isPassed && previousAttempts.length === 0) {
        // First time passing!
        const xpResult = await GamificationService.awardXP(userId, Math.floor(score), "Quiz Passed")
        if (xpResult) xpAwarded = xpResult.xpGained

        // Mark section as completed if not already
        if (quiz.sectionId) {
             await prisma.userProgress.upsert({
                where: { userId_sectionId: { userId, sectionId: quiz.sectionId } },
                update: { completed: true, completedAt: new Date(), quizScore: score },
                create: { 
                    userId, 
                    sectionId: quiz.sectionId, 
                    courseId: quiz.section.courseId, 
                    completed: true, 
                    completedAt: new Date(),
                    quizScore: score
                }
            })
        }
    }

    revalidatePath(`/dashboard/courses/${quiz.section?.courseId}/sections/${quiz.sectionId}`)

    return {
      success: true,
      score,
      isPassed,
      correctCount,
      totalQuestions: quiz.questions.length,
      results,
      xpAwarded
    }

  } catch (error) {
    console.error("Submit quiz error:", error)
    return { success: false, message: "Failed to submit quiz" }
  }
}
