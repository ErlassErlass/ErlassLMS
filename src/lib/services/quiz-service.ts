// lib/services/quiz-service.ts
import { prisma } from "@/lib/db"

export class QuizService {
  // Get quiz untuk section tertentu
  static async getQuizBySection(sectionId: string) {
    return await prisma.quiz.findFirst({
      where: {
        sectionId,
        isActive: true
      },
      include: {
        questions: {
          include: {
            question: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    })
  }

  // Start quiz attempt
  static async startQuizAttempt(quizId: string, userId: string) {
    // Cek apakah user sudah attempt dan masih dalam batas maxAttempts
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        attempts: {
          where: { userId },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!quiz) {
      throw new Error('Quiz not found')
    }

    // Cek attempt limit
    if (quiz.attempts.length >= quiz.maxAttempts) {
      throw new Error('Maximum attempts reached')
    }

    // Create new attempt
    return await prisma.quizAttempt.create({
      data: {
        userId,
        quizId,
      }
    })
  }

  // Submit quiz attempt
  static async submitQuizAttempt(attemptId: string, answers: any, timeSpent: number) {
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          include: {
            questions: {
              include: {
                question: true
              }
            }
          }
        }
      }
    })

    if (!attempt) {
      throw new Error('Attempt not found')
    }

    // Calculate score
    let correctAnswers = 0
    const totalQuestions = attempt.quiz.questions.length

    attempt.quiz.questions.forEach(quizQuestion => {
      const userAnswer = answers[quizQuestion.question.id]
      if (userAnswer === quizQuestion.question.correctAnswer) {
        correctAnswers++
      }
    })

    const score = (correctAnswers / totalQuestions) * 100

    // Update attempt
    const updatedAttempt = await prisma.quizAttempt.update({
      where: { id: attemptId },
      data: {
        score,
        timeSpent,
        answers,
        completedAt: new Date()
      }
    })

    return updatedAttempt
  }

  // Get user's quiz attempts
  static async getUserQuizAttempts(userId: string, quizId: string) {
    return await prisma.quizAttempt.findMany({
      where: {
        userId,
        quizId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }
}