'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { buyItem, equipItem, ShopItem } from "@/app/actions/shop-actions"
import { Loader2, Check, Lock, Shield, Star } from "lucide-react"

interface ShopClientProps {
    item: ShopItem
    userXp: number
}

export function ShopClient({ item, userXp }: ShopClientProps) {
    const [loading, setLoading] = useState(false)
    
    // Determine status
    const canAfford = userXp >= item.cost
    const isOwned = item.purchased
    const isActive = item.active

    const handleBuy = async () => {
        if (!canAfford) return
        setLoading(true)
        try {
            await buyItem(item.id)
            // In a real app, we'd use a toast here
        } finally {
            setLoading(false)
        }
    }

    const handleEquip = async () => {
        setLoading(true)
        try {
            await equipItem(item.id, item.type)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={`
            relative bg-white rounded-2xl p-6 border-2 transition-all duration-300
            ${isActive ? 'border-green-500 shadow-md ring-2 ring-green-100' : 'border-gray-100 hover:border-blue-200 hover:-translate-y-1'}
        `}>
            {isActive && (
                <div className="absolute top-4 right-4 bg-green-500 text-white p-1 rounded-full shadow-sm">
                    <Check className="h-4 w-4" />
                </div>
            )}
            
            {item.isPremium && !isOwned && (
                <div className="absolute top-4 left-4 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current" /> PREMIUM
                </div>
            )}

            {/* PREVIEW AREA */}
            <div className="h-32 flex items-center justify-center mb-4 bg-gray-50 rounded-xl relative overflow-hidden">
                {item.type === 'FRAME' && (
                    <div className="relative">
                        <div className={`w-16 h-16 rounded-full bg-gray-300 border-2 ${item.assetUrl}`}></div>
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500 font-bold">You</div>
                    </div>
                )}
                {item.type === 'TITLE' && (
                    <Badge variant="outline" className="border-secondary text-secondary font-bold px-3 py-1">
                        {item.assetUrl}
                    </Badge>
                )}
            </div>

            <div className="mb-4">
                <h3 className="font-bold text-gray-800">{item.name}</h3>
                <p className="text-xs text-gray-500 line-clamp-2 min-h-[2.5em]">{item.description}</p>
            </div>

            <div className="flex items-center justify-between mt-auto">
                <div className="font-black text-gray-700">
                    {item.cost === 0 ? "FREE" : `${item.cost} XP`}
                </div>

                {isOwned ? (
                    isActive ? (
                        <Button disabled size="sm" className="bg-green-100 text-green-700 opacity-100">
                            Dipakai
                        </Button>
                    ) : (
                        <Button 
                            size="sm" 
                            variant="outline"
                            onClick={handleEquip}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Pakai"}
                        </Button>
                    )
                ) : (
                    <Button 
                        size="sm" 
                        onClick={handleBuy}
                        disabled={!canAfford || loading}
                        className={!canAfford ? "opacity-50" : "bg-primary hover:bg-primary/90"}
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Beli"}
                    </Button>
                )}
            </div>
        </div>
    )
}
