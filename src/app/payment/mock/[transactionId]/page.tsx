
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { processMockPayment } from "@/app/actions/checkout-actions"

// Client component for the "Pay" button
import MockPayButton from "./mock-pay-button"

export default async function MockPaymentPage({ params }: { params: Promise<{ transactionId: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/auth/signin')

  const { transactionId } = await params
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { course: true }
  })

  if (!transaction) notFound()
  if (transaction.status === 'PAID') redirect(`/dashboard/courses/${transaction.courseId}`)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#0a0a0a] p-4">
      <Card className="w-full max-w-md border-2 border-gray-200 dark:border-gray-800 shadow-xl rounded-3xl overflow-hidden">
        <div className="bg-secondary p-6 text-white text-center">
            <h1 className="font-bold text-2xl mb-1">Mock Payment Gateway</h1>
            <p className="text-blue-100 text-sm">Simulasi Pembayaran (Dev Mode)</p>
        </div>
        <CardContent className="p-8 space-y-6">
            <div className="text-center">
                <p className="text-gray-500 text-sm mb-1">Total Pembayaran</p>
                <p className="text-3xl font-black text-[#1F2937] dark:text-white">
                    Rp {transaction.totalAmount.toLocaleString()}
                </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-500">Order ID</span>
                    <span className="font-mono font-bold">{transaction.id.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">Item</span>
                    <span className="font-bold truncate max-w-[200px]">{transaction.course.title}</span>
                </div>
            </div>

            <MockPayButton transactionId={transaction.id} courseId={transaction.courseId} />
            
            <div className="text-center">
                <Link href={`/dashboard/courses/${transaction.courseId}/checkout`} className="text-xs text-gray-400 hover:underline">
                    Batalkan Pembayaran
                </Link>
            </div>
        </CardContent>
      </Card>
    </div>
  )
}
