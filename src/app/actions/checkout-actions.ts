'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { validateVoucher } from "@/app/actions/admin-voucher-actions"
import { redirect } from "next/navigation"

import { iPaymu } from "@/lib/services/ipaymu"

export async function createTransaction(courseId: string, voucherCode?: string) {
  const session = await getServerSession(authOptions)
  if (!session) return { error: "Unauthorized" }

  try {
    const userId = session.user.id

    // 1. Get Course
    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course) return { error: "Course not found" }

    // 2. Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId } }
    })
    if (existingEnrollment) return { error: "Already enrolled" }

    // 3. Calculate Price & Validate Voucher
    let amount = course.price
    let discountAmount = 0
    let totalAmount = amount
    let voucherId = null

    if (voucherCode) {
        const voucherCheck = await validateVoucher(voucherCode, amount)
        if (voucherCheck.valid) {
            discountAmount = voucherCheck.discountAmount || 0
            totalAmount = Math.max(0, voucherCheck.finalPrice || (amount - discountAmount))
            voucherId = voucherCheck.voucherId
        }
    }

    // 4. Create Pending Transaction
    const transaction = await prisma.transaction.create({
        data: {
            userId,
            courseId,
            amount,
            discountAmount,
            totalAmount,
            status: 'PENDING',
            voucherId: voucherId || undefined,
            snapToken: 'PENDING'
        }
    })

    // 5. Call iPaymu Gateway
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    
    // iPaymu Sandbox might need specific IP or referer? usually no.
    // Ensure data types are string arrays
    const paymentRes = await iPaymu.createPayment({
        product: [course.title],
        qty: ["1"],
        price: [totalAmount.toString()],
        amount: totalAmount.toString(),
        referenceId: transaction.id,
        returnUrl: `${baseUrl}/payment/status?transactionId=${transaction.id}&status=success`,
        cancelUrl: `${baseUrl}/payment/status?transactionId=${transaction.id}&status=cancel`,
        notifyUrl: `${baseUrl}/api/payment/notify`, // Webhook
        buyerName: session.user.name || 'Guest',
        buyerEmail: session.user.email || 'no-email@example.com'
    })

    if (!paymentRes.success) {
        // Mark as failed
        await prisma.transaction.update({
            where: { id: transaction.id },
            data: { status: 'FAILED' }
        })
        return { error: "Payment gateway error: " + paymentRes.message }
    }

    // Update transaction with Session ID
    await prisma.transaction.update({
        where: { id: transaction.id },
        data: { snapToken: paymentRes.sessionId }
    })

    // NOTE: Voucher usage increment moved to verification phase (webhook) to prevent burning vouchers on abandoned carts.
    // Or kept here if we want to reserve it.
    // For now, we will NOT increment here to be safe for users.

    return { success: true, transactionId: transaction.id, paymentUrl: paymentRes.url }

  } catch (error) {
    console.error("Create transaction error:", error)
    return { error: "Failed to create transaction" }
  }
}

export async function processMockPayment(transactionId: string) {
  const session = await getServerSession(authOptions)
  if (!session) return { error: "Unauthorized" }

  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { course: true }
    })

    if (!transaction) return { error: "Transaction not found" }
    if (transaction.status === 'PAID') return { error: "Already paid" }

    // Update transaction status
    await prisma.transaction.update({
      where: { id: transactionId },
      data: { 
        status: 'PAID',
        paymentType: 'mock_sandbox'
      }
    })

    // Create enrollment
    await prisma.enrollment.create({
      data: {
        userId: transaction.userId,
        courseId: transaction.courseId,
        transactionId: transaction.id,
        status: 'ENROLLED'
      }
    })
    
    // If voucher used, increment usage count
    if (transaction.voucherId) {
      await prisma.voucher.update({
        where: { id: transaction.voucherId },
        data: { usedCount: { increment: 1 } }
      })
    }

    return { success: true }
  } catch (error) {
    console.error("Mock payment error:", error)
    return { error: "Payment failed" }
  }
}

// Helper to verify payment status (called by returnUrl page)
// MOVED TO verify-actions.ts to avoid circular dependency issues or separate concerns
// export async function verifyPaymentStatus(transactionId: string) { ... }

