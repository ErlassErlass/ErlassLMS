'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function updateProfile(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session) return { error: "Unauthorized" }

  const name = formData.get("name") as string
  const phone = formData.get("phone") as string
  const bio = formData.get("bio") as string
  
  // Basic validation
  if (!name || name.length < 3) {
      return { error: "Nama harus minimal 3 karakter" }
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        phone,
        // Update Mentor Bio if user is a mentor
        ...(session.user.role === 'MENTOR' && {
            mentorProfile: {
                upsert: {
                    create: { bio },
                    update: { bio }
                }
            }
        })
      }
    })

    revalidatePath("/dashboard/profile")
    return { success: true }
  } catch (error) {
    console.error("Update profile error:", error)
    return { error: "Gagal mengupdate profil" }
  }
}
