import { verifyPaymentStatus } from "@/app/actions/verify-actions"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function PaymentStatusPage({ searchParams }: { searchParams: Promise<{ transactionId: string, status: string }> }) {
    const params = await searchParams
    const { transactionId, status } = params

    if (!transactionId) redirect('/dashboard')

    let isSuccess = false
    let courseId = ''
    let message = ''

    if (status === 'success') {
        const res = await verifyPaymentStatus(transactionId)
        if (res.success && res.courseId) {
            isSuccess = true
            courseId = res.courseId
        } else {
            message = "Gagal memverifikasi pembayaran. Silakan hubungi support."
        }
    } else {
        message = "Pembayaran dibatalkan atau gagal."
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#0a0a0a] p-4">
            <Card className="w-full max-w-md border-2 border-gray-200 dark:border-gray-800 shadow-xl rounded-3xl overflow-hidden">
                <div className={`p-6 text-white text-center ${isSuccess ? 'bg-green-600' : 'bg-red-600'}`}>
                    <div className="flex justify-center mb-4">
                        {isSuccess ? <CheckCircle className="h-16 w-16" /> : <XCircle className="h-16 w-16" />}
                    </div>
                    <h1 className="font-bold text-2xl mb-1">{isSuccess ? 'Pembayaran Berhasil!' : 'Pembayaran Gagal'}</h1>
                    <p className="text-white/80 text-sm">{isSuccess ? 'Selamat belajar!' : message}</p>
                </div>
                <CardContent className="p-8 space-y-6 text-center">
                    <p className="text-gray-500">
                        {isSuccess 
                            ? "Transaksi Anda telah dikonfirmasi. Anda sekarang memiliki akses penuh ke kursus ini."
                            : "Silakan coba lagi atau gunakan metode pembayaran lain."
                        }
                    </p>

                    <div className="space-y-3">
                        {isSuccess ? (
                            <Link href={`/dashboard/courses/${courseId}`}>
                                <Button className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl">
                                    Mulai Belajar
                                </Button>
                            </Link>
                        ) : (
                            <Link href="/dashboard/courses">
                                <Button variant="outline" className="w-full h-12 rounded-xl border-2">
                                    Kembali ke Kursus
                                </Button>
                            </Link>
                        )}
                        
                        <Link href="/dashboard">
                            <Button variant="ghost" className="text-gray-500">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Ke Dashboard
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
