
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { iPaymu } from "@/lib/services/ipaymu"

// Helper to verify payment status (called by returnUrl page)
export async function verifyPaymentStatus(transactionId: string) {
    const transaction = await prisma.transaction.findUnique({ where: { id: transactionId } })
    if (!transaction) return { error: "Not found" }
    
    // STRICT SECURITY: Don't trust the client redirect alone.
    // We MUST query iPaymu to confirm the transaction status is actually 'paid'.
    // NOTE: iPaymu "Check Transaction" API implementation needed in service.
    // For now, since we don't have the 'checkTransaction' wrapper, we will implement a basic version or warn.
    
    // TODO: Implement iPaymu Check Transaction API call here
    // const statusIpaymu = await iPaymu.checkTransaction(transactionId)
    // if (statusIpaymu.status === 'BERHASIL') { ... }

    // For Sandbox/Demo purposes as requested, we stick to the database status check
    // which relies on the Mock Payment / Webhook having updated it.
    
    if (transaction.status === 'PAID') {
         // Ensure enrollment exists
         const enrollment = await prisma.enrollment.findUnique({
             where: { userId_courseId: { userId: transaction.userId, courseId: transaction.courseId } }
         })
         
         if (!enrollment) {
             // Fix consistency if missing
            await prisma.enrollment.create({
                data: {
                    userId: transaction.userId,
                    courseId: transaction.courseId,
                    transactionId: transaction.id,
                    status: 'ENROLLED',
                    progressPercentage: 0
                }
            })
         }
         return { success: true, courseId: transaction.courseId }
    }
    
    return { success: false, message: "Payment not verified" }
}
