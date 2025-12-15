'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle } from "lucide-react"
import { processMockPayment } from "@/app/actions/checkout-actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function MockPayButton({ transactionId, courseId }: { transactionId: string, courseId: string }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handlePay = async () => {
        setLoading(true)
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        try {
            const res = await processMockPayment(transactionId)
            if (res.success) {
                toast.success("Pembayaran Berhasil!")
                router.push(`/dashboard/courses/${courseId}`)
            } else {
                toast.error("Pembayaran Gagal")
            }
        } catch (error) {
            toast.error("Error processing payment")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button 
            onClick={handlePay} 
            disabled={loading}
            className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl"
        >
            {loading ? (
                <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Memproses...
                </>
            ) : (
                "Bayar Sekarang (Simulasi)"
            )}
        </Button>
    )
}
