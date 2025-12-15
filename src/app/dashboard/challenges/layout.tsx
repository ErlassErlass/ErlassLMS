import { ReactNode } from "react"

export default function ChallengesLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="border-4 border-dashed border-gray-200 rounded-lg h-full">
          {children}
        </div>
      </div>
    </div>
  )
}