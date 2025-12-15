'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function createVoucher(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'SUPERADMIN') return { error: "Unauthorized" }

  const code = (formData.get('code') as string).toUpperCase()
  const description = formData.get('description') as string
  const discountType = formData.get('discountType') as 'PERCENTAGE' | 'FIXED'
  const discountValue = parseInt(formData.get('discountValue') as string)
  const maxUsage = parseInt(formData.get('maxUsage') as string) || 100
  const minPurchase = parseInt(formData.get('minPurchase') as string) || 0
  const expiresAt = formData.get('expiresAt') ? new Date(formData.get('expiresAt') as string) : null

  try {
    await prisma.voucher.create({
      data: {
        code,
        description,
        discountType,
        discountValue,
        maxUsage,
        minPurchase,
        expiresAt,
        isActive: true
      }
    })
    
    revalidatePath('/dashboard/admin/vouchers')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to create voucher" }
  }
}

export async function deleteVoucher(id: string) {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'SUPERADMIN') return { error: "Unauthorized" }

  try {
    await prisma.voucher.delete({ where: { id } })
    revalidatePath('/dashboard/admin/vouchers')
    return { success: true }
  } catch (error) {
    return { error: "Failed to delete voucher" }
  }
}

export async function validateVoucher(code: string, coursePrice: number) {
    const voucher = await prisma.voucher.findUnique({
        where: { code: code.toUpperCase() }
    })

    if (!voucher) return { valid: false, message: "Kode voucher tidak ditemukan" }
    if (!voucher.isActive) return { valid: false, message: "Voucher tidak aktif" }
    if (voucher.usedCount >= voucher.maxUsage) return { valid: false, message: "Kuota voucher habis" }
    if (voucher.expiresAt && new Date() > voucher.expiresAt) return { valid: false, message: "Voucher kadaluarsa" }
    if (coursePrice < voucher.minPurchase) return { valid: false, message: `Minimal pembelian Rp ${voucher.minPurchase.toLocaleString()}` }

    // Calculate discount
    let discountAmount = 0
    if (voucher.discountType === 'FIXED') {
        discountAmount = voucher.discountValue
    } else {
        discountAmount = (coursePrice * voucher.discountValue) / 100
        if (voucher.maxDiscount && discountAmount > voucher.maxDiscount) {
            discountAmount = voucher.maxDiscount
        }
    }

    // Ensure discount doesn't exceed price
    if (discountAmount > coursePrice) discountAmount = coursePrice

    return { 
        valid: true, 
        voucherId: voucher.id,
        discountAmount,
        finalPrice: coursePrice - discountAmount,
        message: "Voucher berhasil digunakan!"
    }
}

// ... existing code ...
export async function generateBulkVouchers(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'SUPERADMIN') return { error: "Unauthorized" }

  const prefix = (formData.get('prefix') as string || 'ERLASS').toUpperCase()
  const quantity = parseInt(formData.get('quantity') as string) || 10
  const description = formData.get('description') as string
  const discountType = formData.get('discountType') as 'PERCENTAGE' | 'FIXED'
  const discountValue = parseInt(formData.get('discountValue') as string)
  const minPurchase = parseInt(formData.get('minPurchase') as string) || 0
  const expiresAt = formData.get('expiresAt') ? new Date(formData.get('expiresAt') as string) : null
  
  // Clean Code: Single-use vouchers for bulk generation
  const maxUsage = 1 

  const vouchersData = []
  const generatedCodes = new Set<string>()

  // Safety limit
  if (quantity > 500) return { error: "Max 500 vouchers at a time" }

  while (generatedCodes.size < quantity) {
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase()
    const code = `${prefix}-${randomSuffix}`
    
    // Ensure uniqueness in current batch
    if (!generatedCodes.has(code)) {
      generatedCodes.add(code)
      vouchersData.push({
        code,
        description: description || `Bulk generated (${prefix})`,
        discountType,
        discountValue,
        maxUsage,
        minPurchase,
        expiresAt,
        isActive: true,
        usedCount: 0
      })
    }
  }

  try {
    await prisma.voucher.createMany({
      data: vouchersData,
      skipDuplicates: true, 
    })
    
    revalidatePath('/dashboard/admin/vouchers')
    return { success: true, count: vouchersData.length }
  } catch (error) {
    console.error("Bulk generation error:", error)
    return { error: "Failed to generate bulk vouchers" }
  }
}
