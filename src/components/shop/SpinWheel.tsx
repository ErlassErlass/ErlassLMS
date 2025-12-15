'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { checkCanSpin, performSpin } from "@/app/actions/spin-actions"
import { Loader2, Gift, PartyPopper } from "lucide-react"
import confetti from "canvas-confetti"

export function SpinWheel() {
  const [canSpin, setCanSpin] = useState(false)
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [result, setResult] = useState<any>(null)
  const [showResult, setShowResult] = useState(false)

  useEffect(() => {
    checkCanSpin().then(res => setCanSpin(res.canSpin))
  }, [])

  const handleSpin = async () => {
    if (!canSpin || spinning) return
    setSpinning(true)

    // 1. Start visual spinning (infinite)
    // We'll simulate this by adding classes or just waiting for server response
    
    // 2. Call Server
    const res = await performSpin()
    
    if (res.error) {
        alert(res.error)
        setSpinning(false)
        return
    }

    // 3. Calculate target rotation based on reward (Mock visual)
    // Let's just do a generic multi-spin for now
    const newRotation = rotation + 1440 + Math.random() * 360 // 4 full spins + random
    setRotation(newRotation)

    // 4. Wait for animation to finish
    setTimeout(() => {
        setResult(res)
        setShowResult(true)
        setSpinning(false)
        setCanSpin(false) // Disable until tomorrow
        
        if (res.rewardType !== 'ZONK') {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            })
        }
    }, 3000) // 3 seconds spin
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border-2 border-purple-100 dark:border-purple-900 shadow-lg relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
      
      <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
        {/* Text Section */}
        <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-black text-purple-700 dark:text-purple-300 mb-2 flex items-center justify-center md:justify-start gap-2">
                <Gift className="h-6 w-6" />
                Daily Spin
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Putar rodanya setiap hari dan menangkan hadiah XP atau Voucher spesial!
            </p>
            
            {canSpin ? (
                <Button 
                    size="lg" 
                    onClick={handleSpin} 
                    disabled={spinning}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-md w-full md:w-auto transform hover:scale-105 transition-all"
                >
                    {spinning ? <Loader2 className="animate-spin h-5 w-5" /> : "PUTAR SEKARANG!"}
                </Button>
            ) : (
                <Button disabled className="bg-gray-200 text-gray-400 font-bold rounded-xl w-full md:w-auto">
                    Kembali Besok
                </Button>
            )}
        </div>

        {/* Wheel Visual */}
        <div className="relative w-48 h-48 flex-shrink-0">
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-2 w-4 h-6 bg-red-500 z-20 rounded-b-full shadow-md border-2 border-white"></div>
            
            {/* The Wheel */}
            <div 
                className="w-full h-full rounded-full border-4 border-white shadow-xl bg-[conic-gradient(#FF5656_0deg_90deg,#FFA239_90deg_180deg,#41A67E_180deg_270deg,#8CE4FF_270deg_360deg)] relative transition-transform duration-[3000ms] cubic-bezier(0.2, 0.8, 0.2, 1)"
                style={{ transform: `rotate(${rotation}deg)` }}
            >
                {/* Center Cap */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-md z-10 flex items-center justify-center">
                    <div className="w-4 h-4 bg-purple-200 rounded-full animate-pulse"></div>
                </div>
            </div>
        </div>
      </div>

      {/* Result Dialog */}
      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className="sm:max-w-sm rounded-2xl text-center">
            <DialogHeader>
                <DialogTitle className="text-center text-xl">Hasil Spin</DialogTitle>
            </DialogHeader>
            <div className="py-6">
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${result?.rewardType === 'ZONK' ? 'bg-gray-100 text-gray-400' : 'bg-yellow-100 text-yellow-600'}`}>
                    {result?.rewardType === 'ZONK' ? <Loader2 className="h-10 w-10" /> : <PartyPopper className="h-10 w-10" />}
                </div>
                <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-2">
                    {result?.message}
                </h3>
                <p className="text-sm text-gray-500">
                    {result?.rewardType === 'XP' && "XP telah ditambahkan ke akunmu."}
                    {result?.rewardType === 'VOUCHER' && "Cek halaman voucher untuk menggunakannya."}
                    {result?.rewardType === 'ZONK' && "Jangan menyerah, coba lagi besok!"}
                </p>
            </div>
            <Button onClick={() => setShowResult(false)} className="w-full">Tutup</Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
