import CheckoutClient from "@/components/checkout/checkout-client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

type Props = {
    params: Promise<{ courseId: string }>
}

export const dynamic = 'force-dynamic'

export default async function CheckoutPage({ params }: Props) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/auth/signin')

  const resolvedParams = await params
  const courseId = resolvedParams?.courseId
  
  if (!courseId) notFound()

  const course = await prisma.course.findUnique({ where: { id: courseId } })
  
  if (!course) notFound()
  // if (!course.isPremium) redirect(`/dashboard/courses/${courseId}`) 

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-12 max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
            <Link href={`/dashboard/courses/${courseId}`}>
            <Button variant="outline" size="icon" className="rounded-full">
                <ChevronLeft className="h-5 w-5" />
            </Button>
            </Link>
            <h1 className="text-3xl font-black text-[#1F2937] dark:text-white">Checkout</h1>
        </div>
        <CheckoutClient course={course} user={session.user} />
    </div>
  )
}
