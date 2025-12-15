'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { claimQuest } from "@/app/actions/daily-actions"
import { CheckCircle2, Circle, Gift } from "lucide-react"

export function DailyQuestCard({ quest }: { quest: any }) {
    const [loading, setLoading] = useState(false)
    const isCompleted = quest.progress >= quest.target
    const isClaimed = quest.isClaimed

    const handleClaim = async () => {
        setLoading(true)
        await claimQuest(quest.id)
        setLoading(false)
    }

    return (
        <div className={`
            flex items-center justify-between p-4 rounded-xl border-2 transition-all
            ${isClaimed ? 'bg-gray-50 border-gray-100 opacity-60' : 
              isCompleted ? 'bg-green-50 border-green-200 shadow-sm' : 'bg-white border-gray-100'}
        `}>
            <div className="flex items-center gap-3">
                {isCompleted ? (
                    <CheckCircle2 className={`h-6 w-6 ${isClaimed ? 'text-gray-400' : 'text-green-500'}`} />
                ) : (
                    <Circle className="h-6 w-6 text-gray-300" />
                )}
                <div>
                    <h4 className={`font-bold text-sm ${isClaimed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                        {quest.description}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-orange-500 bg-orange-100 px-2 py-0.5 rounded-full">
                            +{quest.xpReward} XP
                        </span>
                        <span className="text-xs text-gray-400">
                            {quest.progress}/{quest.target}
                        </span>
                    </div>
                </div>
            </div>

            {isCompleted && !isClaimed && (
                <Button size="sm" onClick={handleClaim} disabled={loading} className="bg-green-500 hover:bg-green-600 text-white font-bold h-8 text-xs animate-pulse">
                    <Gift className="h-3 w-3 mr-1" />
                    Klaim
                </Button>
            )}
        </div>
    )
}
