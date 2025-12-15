"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { markSectionComplete } from "@/app/actions/course-actions"
import { useRouter } from "next/navigation"

interface SectionNavigationProps {
  courseId: string
  sectionId: string
  prevSectionId?: string
  nextSectionId?: string
  isCompleted: boolean
}

export function SectionNavigation({ 
  courseId, 
  sectionId, 
  prevSectionId, 
  nextSectionId,
  isCompleted: initialCompleted
}: SectionNavigationProps) {
  const [isCompleted, setIsCompleted] = useState(initialCompleted)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleToggleComplete = async () => {
    if (isCompleted) return // Already completed, maybe allow uncomplete later?

    setIsLoading(true)
    try {
      const result = await markSectionComplete(courseId, sectionId)
      if (result.success) {
        setIsCompleted(true)
        router.refresh() // Refresh data to update sidebar checks
      }
    } catch (error) {
      console.error("Failed to update progress", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      {prevSectionId && (
        <Link href={`/dashboard/courses/${courseId}/sections/${prevSectionId}`}>
          <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Sebelumnya
          </Button>
        </Link>
      )}
      
      <Button 
        className={`${isCompleted ? 'bg-green-600 hover:bg-green-700' : 'bg-[#FF5656] hover:bg-[#CC0000]'} text-white font-bold px-6 shadow-lg transition-all`}
        onClick={handleToggleComplete}
        disabled={isLoading || isCompleted}
      >
        {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
        ) : isCompleted ? (
            <>
                Selesai
                <CheckCircle className="h-4 w-4 ml-2" />
            </>
        ) : (
            <>
                Tandai Selesai
                <CheckCircle className="h-4 w-4 ml-2" />
            </>
        )}
      </Button>

      {nextSectionId && (
        <Link href={`/dashboard/courses/${courseId}/sections/${nextSectionId}`}>
          <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800">
            Selanjutnya
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      )}
    </div>
  )
}
