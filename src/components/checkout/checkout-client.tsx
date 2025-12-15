'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CreditCard, Tag, ShieldCheck, ChevronRight } from "lucide-react"
import { createTransaction } from "@/app/actions/checkout-actions"
import { validateVoucher } from "@/app/actions/admin-voucher-actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface CheckoutClientProps {
  course: any
  user: any
}

export default function CheckoutClient({ course, user }: CheckoutClientProps) {
  const [voucherCode, setVoucherCode] = useState("")
  const [discount, setDiscount] = useState(0)
  const [isValidating, setIsValidating] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  const total = course.price - discount

  const handleApplyVoucher = async () => {
    if (!voucherCode) return
    setIsValidating(true)
    try {
        const res = await validateVoucher(voucherCode, course.price)
        if (res.valid) {
            setDiscount(res.discountAmount || 0)
            toast.success("Voucher berhasil digunakan!")
        } else {
            setDiscount(0)
            toast.error(res.message)
        }
    } catch (error) {
        toast.error("Gagal memvalidasi voucher")
    } finally {
        setIsValidating(false)
    }
  }

  const handlePay = async () => {
    setIsProcessing(true)
    try {
        const res = await createTransaction(course.id, discount > 0 ? voucherCode : undefined)
        if (res.success && res.paymentUrl) {
            // Redirect to iPaymu Payment Page
            window.location.href = res.paymentUrl
        } else {
            toast.error(res.error || "Transaksi gagal dibuat")
        }
    } catch (error) {
        toast.error("Terjadi kesalahan sistem")
    } finally {
        setIsProcessing(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left: Order Summary */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="border-2 border-gray-100 dark:border-gray-700 shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700 pb-6">
                <CardTitle className="text-xl font-black">Ringkasan Pesanan</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="flex gap-4">
                    <div className="w-24 h-24 bg-gray-200 rounded-xl shrink-0 overflow-hidden">
                        {course.coverImage && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={course.coverImage} alt={course.title} className="w-full h-full object-cover" />
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-[#1F2937] dark:text-white">{course.title}</h3>
                        <p className="text-sm text-gray-500 mt-1 capitalize">{course.level} • {course.category}</p>
                        <p className="font-black text-[#FF5656] mt-2">Rp {course.price.toLocaleString()}</p>
                    </div>
                </div>
            </CardContent>
        </Card>

        <div className="bg-[#E0F7FA] dark:bg-cyan-900/20 p-6 rounded-3xl border-2 border-[#8CE4FF] dark:border-cyan-800 flex items-start gap-4">
            <ShieldCheck className="h-6 w-6 text-[#0088CC] dark:text-cyan-400 shrink-0 mt-1" />
            <div>
                <h4 className="font-bold text-[#0088CC] dark:text-cyan-400">Pembayaran Aman</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Transaksi Anda diproses dengan enkripsi tingkat tinggi. Kami menjamin keamanan data Anda.
                </p>
            </div>
        </div>
      </div>

      {/* Right: Payment Details */}
      <div className="space-y-6">
        <Card className="border-2 border-gray-100 dark:border-gray-700 shadow-lg rounded-3xl sticky top-24">
            <CardHeader>
                <CardTitle>Detail Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Voucher Input */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Tag className="h-4 w-4" /> Kode Promo
                    </label>
                    <div className="flex gap-2">
                        <Input 
                            placeholder="Masukkan kode" 
                            value={voucherCode}
                            onChange={(e) => setVoucherCode(e.target.value)}
                            className="rounded-xl uppercase"
                        />
                        <Button onClick={handleApplyVoucher} disabled={isValidating} className="rounded-xl bg-gray-900 text-white hover:bg-black">
                            {isValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Pakai"}
                        </Button>
                    </div>
                </div>

                {/* Summary */}
                <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Harga Kursus</span>
                        <span className="font-bold">Rp {course.price.toLocaleString()}</span>
                    </div>
                    {discount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                            <span>Diskon</span>
                            <span className="font-bold">- Rp {discount.toLocaleString()}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-lg pt-4 border-t border-gray-100 dark:border-gray-700">
                        <span className="font-black text-[#1F2937] dark:text-white">Total Bayar</span>
                        <span className="font-black text-[#FF5656]">Rp {total.toLocaleString()}</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button 
                    onClick={handlePay} 
                    disabled={isProcessing}
                    className="w-full h-14 text-lg bg-[#FF5656] hover:bg-[#CC0000] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Memproses...
                        </>
                    ) : (
                        <>
                            Bayar Sekarang <ChevronRight className="ml-2 h-5 w-5" />
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
      </div>
    </div>
  )
}
