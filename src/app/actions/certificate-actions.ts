'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { generateId } from "@/lib/id-generator"

interface IssueCertificateProps {
  userId: string
  type: 'COURSE' | 'CHALLENGE' | 'ACHIEVEMENT'
  courseId?: string
  challengeId?: string
  metadata?: Record<string, unknown>
}

export async function issueCertificate({ userId, type, courseId, challengeId, metadata }: IssueCertificateProps) {
  // Validate Session
  const session = await getServerSession(authOptions)
  if (!session) return { error: "Unauthorized" }

  // Only allow Admin or System (if called internally, this check might fail if no session, 
  // but this is a Server Action exposed to client. Internal calls should use a service function, not an action.)
  // If this action is intended to be called by client (e.g. after finishing a course), verify the user.
  if (session.user.id !== userId && session.user.role !== 'SUPERADMIN') {
      return { error: "Forbidden" }
  }

  // Check if already issued
  const existing = await prisma.certificate.findFirst({
    where: {
      userId,
      type,
      courseId: courseId || undefined,
      challengeId: challengeId || undefined
    }
  })

  if (existing) return { success: true, certificate: existing }

  // Generate Serial Number: YEAR-TYPE-RANDOM
  const year = new Date().getFullYear()
  const typeCode = type === 'COURSE' ? 'CRS' : type === 'CHALLENGE' ? 'CHG' : 'ACH'
  const random = Math.floor(10000 + Math.random() * 90000) // 5 digits
  const serialNumber = `ERL-${year}-${typeCode}-${random}`

  try {
    const certificate = await prisma.certificate.create({
      data: {
        id: generateId('certificate'),
        userId,
        type,
        courseId,
        challengeId,
        serialNumber,
        metadata: metadata ? (metadata as any) : {}
      }
    })
    return { success: true, certificate }
  } catch (error) {
    console.error("Issue certificate error:", error)
    return { error: "Gagal menerbitkan sertifikat" }
  }
}

export async function getUserCertificates(userId: string) {
  try {
    const data = await prisma.certificate.findMany({
      where: { userId },
      include: {
        course: { select: { title: true } },
        challenge: { select: { title: true } }
      },
      orderBy: { issuedAt: 'desc' }
    })
    return { success: true, data }
  } catch (error) {
    return { success: false, error: "Gagal memuat sertifikat" }
  }
}
