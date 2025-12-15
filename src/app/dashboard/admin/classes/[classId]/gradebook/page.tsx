
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { getClassGradebook } from "@/app/actions/gradebook-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronLeft, Download } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function ClassGradebookPage({ params }: { params: Promise<{ classId: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/auth/signin')

  const { classId } = await params
  
  const classData = await prisma.class.findUnique({
    where: { id: classId },
    include: { mentor: { include: { user: true } } }
  })

  if (!classData) return <div>Kelas tidak ditemukan</div>

  const { data: students, error } = await getClassGradebook(classId)

  if (error) return <div>Error: {error}</div>

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-12">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/admin/classes">
          <Button variant="outline" size="icon" className="rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
            <h1 className="text-3xl font-black text-secondary">Buku Nilai (Gradebook)</h1>
            <p className="text-gray-600 mt-1">
                Kelas: <span className="font-bold text-primary">{classData.name}</span> ({classData.code})
            </p>
        </div>
        <div className="ml-auto">
            <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" /> Export Excel
            </Button>
        </div>
      </div>

      <Card className="border-2 border-gray-100 shadow-sm rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
            <Table>
                <TableHeader className="bg-gray-50/50">
                    <TableRow>
                        <TableHead className="w-[250px] font-bold text-gray-600">Siswa</TableHead>
                        <TableHead className="font-bold text-gray-600">Progress Kursus</TableHead>
                        <TableHead className="font-bold text-gray-600 text-center">Rata-rata Kuis</TableHead>
                        <TableHead className="font-bold text-gray-600 text-center">Poin Tantangan</TableHead>
                        <TableHead className="font-bold text-gray-600 text-center">Total XP</TableHead>
                        <TableHead className="font-bold text-gray-600 text-right">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {students?.map((student) => (
                        <TableRow key={student.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                                        <AvatarImage src={student.avatar || ""} />
                                        <AvatarFallback className="bg-tertiary/10 text-tertiary">
                                            {student.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="text-secondary font-bold">{student.name}</div>
                                        <div className="text-xs text-gray-500">{student.email}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="space-y-1">
                                    <div className="text-xs font-semibold text-gray-600 truncate max-w-[150px]">
                                        {student.mainCourse}
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-primary rounded-full" 
                                            style={{ width: `${student.progress}%` }}
                                        />
                                    </div>
                                    <div className="text-xs text-right text-gray-500">{student.progress}%</div>
                                </div>
                            </TableCell>
                            <TableCell className="text-center">
                                <span className={`font-bold ${student.quizAverage >= 80 ? 'text-green-600' : 'text-orange-600'}`}>
                                    {student.quizAverage}
                                </span>
                            </TableCell>
                            <TableCell className="text-center font-bold text-accent-foreground">
                                {student.challengePoints} pts
                            </TableCell>
                            <TableCell className="text-center">
                                <Badge variant="secondary" className="bg-tertiary/10 text-tertiary border-0">
                                    {student.xp} XP
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                {student.completed ? (
                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">Lulus</Badge>
                                ) : (
                                    <Badge variant="outline" className="text-gray-500 border-gray-200">Aktif</Badge>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                    {students?.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                Belum ada siswa di kelas ini.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
      </Card>
    </div>
  )
}
