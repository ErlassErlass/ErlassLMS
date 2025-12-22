'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { generateId } from "@/lib/id-generator"

// --- Types ---

type ActionResponse<T = undefined> = {
    success: boolean
    message?: string
    error?: string
    data?: T
}

type VoucherWithCourses = any // Simplified for now since Prisma types are complex to import directly without generation

// --- Constants ---

const ERROR_MESSAGES = {
    UNAUTHORIZED: "Silakan login terlebih dahulu",
    INVALID_CODE: "Kode tidak valid",
    INACTIVE_CODE: "Kode sudah tidak aktif",
    EXPIRED_CODE: "Kode sudah kadaluarsa",
    QUOTA_FULL: "Kuota kode sudah habis",
    NO_COURSES: "Kode ini tidak terhubung ke kursus manapun",
    ALREADY_ENROLLED: "Anda sudah terdaftar di semua kursus dari kode ini",
    DISCOUNT_ONLY: "Kode ini adalah voucher diskon, gunakan saat checkout pembayaran.",
    GENERIC_ERROR: "Gagal memproses kode",
    GENERATE_ERROR: "Gagal membuat kode"
} as const

// --- Main Actions ---

/**
 * Redeems an access code for a user.
 * Principle: Transaction Script pattern but with extracted domain logic.
 */
export async function redeemCode(code: string): Promise<ActionResponse> {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) return { success: false, error: ERROR_MESSAGES.UNAUTHORIZED }

        const voucher = await getVoucherByCode(code)
        
        const validationError = validateVoucherEligibility(voucher)
        if (validationError) return { success: false, error: validationError }

        // We know voucher is not null here due to validationError check
        if (voucher!.type === 'ACCESS_CODE') {
            return await processAccessCodeRedemption(session.user.id, voucher!)
        } 
        
        return { success: false, error: ERROR_MESSAGES.DISCOUNT_ONLY }

    } catch (error) {
        console.error("Redeem error:", error)
        return { success: false, error: ERROR_MESSAGES.GENERIC_ERROR }
    }
}

/**
 * Generates a new access code or a batch of unique codes.
 * Updated to support BULK generation for unique single-use codes.
 */
export async function generateAccessCode(
    courseIds: string[], 
    maxUsage: number, // If batchMode=true, this is "how many codes to generate" (each usage 1). If false, it's usage limit for single code.
    customCode?: string,
    batchMode: boolean = false
): Promise<ActionResponse<{ code: string | string[] }>> {
    const session = await getServerSession(authOptions)
    if (session?.user.role !== 'SUPERADMIN') return { success: false, error: "Unauthorized" }

    try {
        if (batchMode) {
            // --- BATCH MODE (Many Unique Codes) ---
            const count = maxUsage // In batch mode, maxUsage param acts as "quantity"
            const prefix = customCode ? customCode.toUpperCase() : 'ERL'
            const createdCodes: string[] = []

            // We use a transaction to create them efficiently
            await prisma.$transaction(async (tx) => {
                for (let i = 0; i < count; i++) {
                    const uniqueSuffix = Math.random().toString(36).substring(2, 8).toUpperCase()
                    const uniqueCode = `${prefix}-${uniqueSuffix}`
                    
                    await tx.voucher.create({
                        data: {
                            code: uniqueCode,
                            type: 'ACCESS_CODE',
                            description: `Batch Generated Code (${i+1}/${count})`,
                            discountValue: 100,
                            maxUsage: 1, // Single use per code
                            courses: {
                                connect: courseIds.map(id => ({ id }))
                            }
                        }
                    })
                    createdCodes.push(uniqueCode)
                }
            })

            revalidatePath('/dashboard/admin/vouchers')
            return { success: true, data: { code: createdCodes } }

        } else {
            // --- SINGLE SHARED CODE MODE (Old Behavior) ---
            const code = customCode || generateRandomCode()
            
            await prisma.voucher.create({
                data: {
                    code,
                    type: 'ACCESS_CODE',
                    description: 'Generated Shared Access Code',
                    discountValue: 100, 
                    maxUsage: maxUsage, // Shared limit
                    courses: {
                        connect: courseIds.map(id => ({ id }))
                    }
                }
            })
            revalidatePath('/dashboard/admin/vouchers')
            return { success: true, data: { code } }
        }

    } catch (error) {
        console.error("Generate code error:", error)
        return { success: false, error: ERROR_MESSAGES.GENERATE_ERROR }
    }
}

// --- Helper Functions (Private) ---

async function getVoucherByCode(code: string): Promise<VoucherWithCourses | null> {
    return await prisma.voucher.findUnique({
        where: { code },
        include: { courses: true }
    })
}

function validateVoucherEligibility(voucher: VoucherWithCourses | null): string | null {
    if (!voucher) return ERROR_MESSAGES.INVALID_CODE
    if (!voucher.isActive) return ERROR_MESSAGES.INACTIVE_CODE
    if (voucher.expiresAt && voucher.expiresAt < new Date()) return ERROR_MESSAGES.EXPIRED_CODE
    if (voucher.usedCount >= voucher.maxUsage) return ERROR_MESSAGES.QUOTA_FULL
    if (voucher.courses.length === 0) return ERROR_MESSAGES.NO_COURSES
    return null
}

async function processAccessCodeRedemption(userId: string, voucher: VoucherWithCourses): Promise<ActionResponse> {
    const courseIds = voucher.courses.map((c: any) => c.id)
    
    // Fail fast if already enrolled in all
    const alreadyEnrolledCount = await prisma.enrollment.count({
        where: {
            userId,
            courseId: { in: courseIds }
        }
    })

    if (alreadyEnrolledCount === courseIds.length) {
        return { success: false, error: ERROR_MESSAGES.ALREADY_ENROLLED }
    }

    const enrolledCount = await executeEnrollmentTransaction(userId, voucher, courseIds)

    if (enrolledCount === 0) {
        return { success: false, error: ERROR_MESSAGES.ALREADY_ENROLLED }
    }

    revalidatePath('/dashboard')
    return { success: true, message: `Berhasil menukarkan kode! ${enrolledCount} kursus ditambahkan.` }
}

async function executeEnrollmentTransaction(userId: string, voucher: VoucherWithCourses, courseIds: string[]): Promise<number> {
    // Using interactive transaction to ensure atomicity
    return await prisma.$transaction(async (tx) => {
        let count = 0
        const transactionId = generateId('transaction')

        // 1. Create Transaction Record
        await tx.transaction.create({
            data: {
                id: transactionId,
                userId,
                courseId: courseIds[0], // Primary reference
                voucherId: voucher.id,
                amount: 0,
                discountAmount: 0,
                totalAmount: 0,
                status: 'PAID',
                paymentType: 'REDEEM_CODE'
            }
        })

        // 2. Process Enrollments
        for (const courseId of courseIds) {
            const existing = await tx.enrollment.findUnique({
                where: { userId_courseId: { userId, courseId } }
            })

            if (!existing) {
                await tx.enrollment.create({
                    data: {
                        userId,
                        courseId,
                        status: 'ENROLLED',
                        progressPercentage: 0
                    }
                })
                count++
            }
        }

        // 3. Update Voucher Usage (Atomic Check for Race Condition)
        if (count > 0) {
            const updateResult = await tx.voucher.updateMany({
                where: { 
                    id: voucher.id,
                    usedCount: { lt: voucher.maxUsage } // CRITICAL: Ensure we don't exceed limit
                },
                data: { usedCount: { increment: 1 } }
            })

            // If no records updated, it means quota was full between our read and write
            if (updateResult.count === 0) {
                throw new Error("QUOTA_EXCEEDED_RACE_CONDITION")
            }
        }

        return count
    })
}

function generateRandomCode(): string {
    return `ERL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
}
