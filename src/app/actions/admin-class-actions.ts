'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { generateId } from "@/lib/id-generator"

export async function createClass(name: string, code: string, mentorId?: string | null, school?: string) {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'SUPERADMIN') return { error: "Unauthorized" }

  try {
    const newClass = await prisma.class.create({
      data: {
        id: generateId('class'), // Using Standard ID: cls_...
        name,
        code,
        school: school || undefined,
        mentorId: mentorId || undefined
      }
    })
    revalidatePath('/dashboard/admin/classes')
    return { success: true, classId: newClass.id }
  } catch (error: any) {
    console.error("Create class error:", error)
    if (error.code === 'P2002') {
      return { error: "Kode kelas sudah digunakan." }
    }
    return { error: "Gagal membuat kelas." }
  }
}

export async function assignStudentToClass(studentId: string, classId: string) {
  const session = await getServerSession(authOptions)
  // Mentor can assign too? Let's stick to Admin for now or Mentor for their own class (future)
  if (session?.user.role !== 'SUPERADMIN' && session?.user.role !== 'MENTOR') return { error: "Unauthorized" }

  try {
    await prisma.user.update({
      where: { id: studentId },
      data: { classId }
    })
    return { success: true }
  } catch (error) {
    console.error("Assign student error:", error)
    return { error: "Gagal menambahkan siswa ke kelas." }
  }
}

export async function deleteClass(classId: string) {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'SUPERADMIN') return { error: "Unauthorized" }

  try {
    await prisma.class.delete({ where: { id: classId } })
    revalidatePath('/dashboard/admin/classes')
    return { success: true }
  } catch (error) {
    return { error: "Gagal menghapus kelas." }
  }
}
