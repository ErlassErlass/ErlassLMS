import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import DashboardNav from "@/components/dashboard/DashboardNav"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#0a0a0a] selection:bg-primary/20 selection:text-primary">
      
      <div className="relative z-10">
        <DashboardNav user={session.user} />
        <div className="lg:pl-72 transition-all duration-300">
          <main className="py-8 max-w-7xl mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}