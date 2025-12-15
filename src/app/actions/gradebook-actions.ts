'use server'

import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function getClassGradebook(classId: string) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== 'SUPERADMIN' && session.user.role !== 'MENTOR')) {
    return { error: "Unauthorized" }
  }

  try {
    // 1. Ambil data siswa dalam kelas
    const students = await prisma.user.findMany({
      where: { classId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        xp: true,
        // Ambil data enrollment untuk progress
        enrollments: {
          select: {
            course: { select: { title: true } },
            progressPercentage: true,
            completedAt: true
          }
        },
        // Ambil rata-rata kuis
        quizAttempts: {
          select: { score: true }
        },
        // Ambil tantangan yang completed
        submissions: {
          where: { passed: true },
          select: { 
            challenge: { select: { points: true } }
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    // 2. Olah data untuk tabel
    const gradebookData = students.map(student => {
      // Hitung Rata-rata Kuis
      const totalQuizScore = student.quizAttempts.reduce((acc, curr) => acc + (curr.score || 0), 0)
      const quizCount = student.quizAttempts.length
      const quizAverage = quizCount > 0 ? Math.round(totalQuizScore / quizCount) : 0

      // Hitung Total Poin Tantangan
      const challengePoints = student.submissions.reduce((acc, curr) => acc + curr.challenge.points, 0)

      // Status Kursus (Ambil kursus dengan progress tertinggi sebagai representasi)
      const mainCourse = student.enrollments.sort((a, b) => b.progressPercentage - a.progressPercentage)[0]

      return {
        id: student.id,
        name: student.name,
        email: student.email,
        avatar: student.avatar,
        xp: student.xp,
        quizAverage,
        challengePoints,
        mainCourse: mainCourse ? mainCourse.course.title : '-',
        progress: mainCourse ? Math.round(mainCourse.progressPercentage) : 0,
        completed: !!mainCourse?.completedAt
      }
    })

    return { success: true, data: gradebookData }

  } catch (error) {
    console.error("Error fetching gradebook:", error)
    return { error: "Gagal mengambil data nilai." }
  }
}
