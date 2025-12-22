'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { uploadImage } from "@/lib/upload"

export async function createCertificateTemplate(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'SUPERADMIN') return { error: "Unauthorized" }

  const name = formData.get('name') as string
  const imageFile = formData.get('imageFile') as File

  if (!name || !imageFile) {
    return { error: "Nama dan File gambar wajib diisi" }
  }

  const imageUrl = await uploadImage(imageFile, 'certificates')
  if (!imageUrl) {
    return { error: "Gagal mengupload gambar" }
  }

  try {
    // Prisma client might not be regenerated yet
    await prisma.certificateTemplate.create({
      data: {
        name,
        imageUrl
      }
    })
    revalidatePath('/dashboard/admin/certificates/templates')
    return { success: true }
  } catch (error) {
    console.error('Create template error:', error)
    return { error: "Gagal membuat template sertifikat" }
  }
}

export async function deleteCertificateTemplate(id: string) {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'SUPERADMIN') return { error: "Unauthorized" }

  try {
    await prisma.certificateTemplate.delete({ where: { id } })
    revalidatePath('/dashboard/admin/certificates/templates')
    return { success: true }
  } catch (error) {
    return { error: "Gagal menghapus template" }
  }
}

export async function getCertificateTemplates() {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'SUPERADMIN') return { error: "Unauthorized" }

  try {
    const templates = await prisma.certificateTemplate.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { courses: true }
        }
      }
    })
    return { success: true, data: templates }
  } catch (error) {
    return { error: "Gagal mengambil data template" }
  }
}
