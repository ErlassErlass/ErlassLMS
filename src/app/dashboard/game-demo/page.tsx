
import CodeGame from "@/components/game/CodeGame"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export default function GameDemoPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-12 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard">
          <Button variant="outline" size="icon" className="rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
            <h1 className="text-3xl font-black text-[#1F2937] dark:text-white">Erlass Code Adventure (Beta)</h1>
            <p className="text-gray-500">Bantu robot mencapai bendera merah menggunakan kode!</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border-2 border-gray-100 dark:border-gray-800 shadow-xl">
        <CodeGame />
      </div>
    </div>
  )
}
