'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { generateId } from "@/lib/id-generator"

export async function getAllCertificates(query: string = '', page: number = 1) {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'SUPERADMIN') return { error: "Unauthorized" }

  const pageSize = 10
  const skip = (page - 1) * pageSize

  try {
    const whereCondition: any = {
      OR: [
        { serialNumber: { contains: query, mode: 'insensitive' } },
        { user: { name: { contains: query, mode: 'insensitive' } } },
        { user: { email: { contains: query, mode: 'insensitive' } } }
      ]
    }

    const [certificates, totalCount] = await Promise.all([
      prisma.certificate.findMany({
        where: whereCondition,
        include: {
          user: { select: { name: true, email: true } },
          course: { select: { title: true } },
          challenge: { select: { title: true } }
        },
        orderBy: { issuedAt: 'desc' },
        skip,
        take: pageSize
      }),
      prisma.certificate.count({ where: whereCondition })
    ])

    return {
      success: true,
      data: certificates,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / pageSize),
        totalCount
      }
    }
  } catch (error) {
    return { error: "Gagal mengambil data sertifikat." }
  }
}

export async function revokeCertificate(id: string) {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'SUPERADMIN') return { error: "Unauthorized" }

  try {
    await prisma.certificate.delete({ where: { id } })
    revalidatePath('/dashboard/admin/certificates')
    return { success: true, message: "Sertifikat berhasil dihapus (revoked)." }
  } catch (error) {
    return { error: "Gagal menghapus sertifikat." }
  }
}

export async function manualIssueCertificate(userId: string, courseId: string) {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'SUPERADMIN') return { error: "Unauthorized" }

  try {
    // 1. Generate Serial
    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course) return { error: "Kursus tidak ditemukan" }

    const year = new Date().getFullYear()
    const random = Math.floor(1000 + Math.random() * 9000)
    const serialNumber = `ERL-${year}-CRS-${course.id.substring(0,4).toUpperCase()}-${random}`

    // 2. Check exist
    const exists = await prisma.certificate.findFirst({
        where: { userId, courseId }
    })
    
    if (exists) return { error: "User sudah memiliki sertifikat untuk kursus ini." }

    // 3. Create
    await prisma.certificate.create({
        data: {
            id: generateId('certificate'),
            userId,
            courseId,
            type: 'COURSE',
            serialNumber,
            metadata: { type: 'MANUAL_ISSUANCE', issuedBy: session.user.email }
        }
    })

    revalidatePath('/dashboard/admin/certificates')
    return { success: true, message: "Sertifikat berhasil diterbitkan manual." }
  } catch (error) {
    return { error: "Gagal menerbitkan sertifikat." }
  }
}
