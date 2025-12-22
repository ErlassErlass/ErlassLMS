'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { redeemCode } from "@/app/actions/redeem-code-actions"
import { toast } from "sonner"
import { KeyRound, Loader2 } from "lucide-react"

export function RedeemCodeWidget() {
    const [code, setCode] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleRedeem(e: React.FormEvent) {
        e.preventDefault()
        if (!code) return

        setLoading(true)
        const res = await redeemCode(code)
        if (res.success) {
            toast.success(res.message)
            setCode("")
            // Force refresh to update UI state (unlocked courses)
            window.location.reload()
        } else {
            toast.error(res.error)
        }
        setLoading(false)
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2.5 rounded-xl text-yellow-700 dark:text-yellow-400">
                        <KeyRound className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 dark:text-white text-lg">Punya Kode Akses?</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Tukar kode voucher atau lisensi sekolah.</p>
                    </div>
                </div>
            </div>
            
            <form onSubmit={handleRedeem} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <label htmlFor="redeem-code" className="sr-only">Masukkan kode akses</label>
                    <Input 
                        id="redeem-code"
                        placeholder="CONTOH: KODE-1234" 
                        value={code}
                        onChange={e => setCode(e.target.value.toUpperCase())}
                        className="uppercase font-mono text-lg h-12 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-yellow-500/20"
                        disabled={loading}
                    />
                </div>
                <Button 
                    type="submit" 
                    disabled={loading || !code}
                    className="h-12 px-8 font-bold bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg shadow-md transition-all active:scale-95"
                >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Tukar Kode"}
                </Button>
            </form>
        </div>
    )
}
