'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, PlayCircle } from "lucide-react"
import { enrollCourse } from "@/app/actions/enroll-actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"

interface EnrollButtonProps {
  courseId: string
  isEnrolled: boolean
}

export default function EnrollButton({ courseId, isEnrolled }: EnrollButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleEnroll = async () => {
    if (isEnrolled) {
      // If already enrolled, go to course
      // We need to fetch the current section or just go to the first one
      // For now, let's just refresh or let the page handle redirection logic if we were to click "Lanjut Belajar"
      // But this button is "Mulai Belajar Gratis" usually.
      return
    }

    setIsLoading(true)
    try {
      const result = await enrollCourse(courseId)
      if (result.success) {
        router.refresh()
        // toast.success("Berhasil mendaftar kursus!")
      } else {
        // toast.error(result.message || "Gagal mendaftar")
      }
    } catch (error) {
      console.error(error)
      // toast.error("Terjadi kesalahan")
    } finally {
      setIsLoading(false)
    }
  }

  if (isEnrolled) {
    return (
    <Link href={`/dashboard/courses/${courseId}`} className="w-full">
        <Button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-500/20 transition-all hover:scale-105 flex items-center justify-center gap-2">
            <PlayCircle className="h-5 w-5" />
            Lanjut Belajar
        </Button>
    </Link>
    )
  }

  return (
    <Button 
      onClick={handleEnroll}
      disabled={isLoading}
      className="w-full bg-[#FF5656] hover:bg-[#CC0000] text-white font-bold py-4 rounded-xl shadow-lg shadow-red-500/20 transition-all hover:scale-105 flex items-center justify-center gap-2"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Mendaftar...
        </>
      ) : (
        <>
          <PlayCircle className="h-5 w-5" />
          Mulai Belajar Gratis
        </>
      )}
    </Button>
  )
}
