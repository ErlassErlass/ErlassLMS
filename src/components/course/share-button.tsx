'use client'

import { Button } from "@/components/ui/button"
import { Share2 } from "lucide-react"
import { toast } from "sonner"

interface ShareButtonProps {
    url: string
    title: string
}

export function ShareButton({ url, title }: ShareButtonProps) {
    const handleShare = async () => {
        const fullUrl = url.startsWith('http') ? url : (typeof window !== 'undefined' ? `${window.location.origin}${url}` : url)
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    url: fullUrl
                })
            } catch (error) {
                // Ignore abort errors
            }
        } else {
            try {
                await navigator.clipboard.writeText(fullUrl)
                toast.success("Link disalin ke clipboard!")
            } catch (error) {
                toast.error("Gagal menyalin link")
            }
        }
    }

    return (
        <Button 
            onClick={handleShare}
            size="lg" 
            variant="outline" 
            className="bg-transparent border-2 border-gray-600 text-white hover:bg-white/10 rounded-xl h-auto py-4 px-6"
        >
            <Share2 className="mr-2 h-5 w-5" />
            Bagikan
        </Button>
    )
}
