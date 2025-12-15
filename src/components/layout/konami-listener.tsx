'use client'

import { useEffect, useState } from "react"
import { unlockMysteryBadge } from "@/app/actions/easter-egg-actions"
import { toast } from "sonner"
import confetti from "canvas-confetti"

export default function KonamiListener() {
  const [keys, setKeys] = useState<string[]>([])
  const konamiCode = [
    "ArrowUp", "ArrowUp", 
    "ArrowDown", "ArrowDown", 
    "ArrowLeft", "ArrowRight", 
    "ArrowLeft", "ArrowRight", 
    "b", "a"
  ]

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      const newKeys = [...keys, e.key]
      if (newKeys.length > konamiCode.length) {
        newKeys.shift()
      }
      setKeys(newKeys)

      // Check sequence
      if (newKeys.join("") === konamiCode.join("")) {
        console.log("Easter Egg Triggered! 🥚")
        
        // Trigger Server Action
        const result = await unlockMysteryBadge("konami-code")
        
        if (result.success && result.badgeName) {
            confetti({
                particleCount: 200,
                spread: 100,
                origin: { y: 0.6 }
            })
            toast.success(`EASTER EGG FOUND! Badge Unlocked: ${result.badgeName}`, {
                description: `You earned +${result.xp} XP!`
            })
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [keys])

  return null // Invisible component
}
