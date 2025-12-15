
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Users, BookOpen, Trophy } from "lucide-react"
import { prisma } from "@/lib/db"

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'SUPERADMIN') redirect('/dashboard')

  const totalUsers = await prisma.user.count()
  const totalCourses = await prisma.course.count()
  const totalEnrollments = await prisma.enrollment.count()
  const totalSubmissions = await prisma.challengeSubmission.count()

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[#1F2937] dark:text-white">Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Ringkasan statistik platform pembelajaran.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-2 border-gray-100 dark:border-gray-700 shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                    <Users className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500">Total Siswa</p>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">{totalUsers}</h3>
                </div>
            </CardContent>
        </Card>

        <Card className="border-2 border-gray-100 dark:border-gray-700 shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                    <BookOpen className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500">Total Kursus</p>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">{totalCourses}</h3>
                </div>
            </CardContent>
        </Card>

        <Card className="border-2 border-gray-100 dark:border-gray-700 shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                    <Trophy className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500">Enrollments</p>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">{totalEnrollments}</h3>
                </div>
            </CardContent>
        </Card>

        <Card className="border-2 border-gray-100 dark:border-gray-700 shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                    <BarChart3 className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500">Submissions</p>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">{totalSubmissions}</h3>
                </div>
            </CardContent>
        </Card>
      </div>

      {/* Placeholder for detailed charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-2 border-gray-100 dark:border-gray-700 shadow-sm h-96 flex items-center justify-center bg-gray-50 dark:bg-gray-800/50">
            <p className="text-gray-400 font-medium">Grafik Pertumbuhan Siswa (Segera Hadir)</p>
        </Card>
        <Card className="border-2 border-gray-100 dark:border-gray-700 shadow-sm h-96 flex items-center justify-center bg-gray-50 dark:bg-gray-800/50">
            <p className="text-gray-400 font-medium">Grafik Aktivitas Belajar (Segera Hadir)</p>
        </Card>
      </div>
    </div>
  )
}
