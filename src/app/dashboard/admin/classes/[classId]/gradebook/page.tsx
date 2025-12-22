
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getClassGradebook } from "@/app/actions/admin-class-actions"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen } from "lucide-react"

export default async function GradebookPage({ params }: { params: Promise<{ classId: string }> }) {
  const session = await getServerSession(authOptions)
  if (session?.user.role === 'USER') redirect('/dashboard')

  const { classId } = await params
  const result = await getClassGradebook(classId)

  if (!result.success || !result.data) {
      return (
        <div className="p-8 text-center text-red-500">
          <p>Error loading gradebook or Unauthorized</p>
        </div>
      )
  }

  // Process Data: Pivot Submissions by Challenge
  const students = result.data.students
  const submissions = result.data.submissions || []
  
  if (students.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Gradebook (Buku Nilai)</h1>
        <Card className="p-12 text-center border-dashed">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
             <Users className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-700">Belum Ada Siswa</h3>
          <p className="text-gray-500 mb-6">Kelas ini belum memiliki siswa yang terdaftar.</p>
        </Card>
      </div>
    )
  }

  // Get unique challenges submitted by this cohort
  const challengeMap = new Map()
  submissions.forEach((s: any) => {
      challengeMap.set(s.challenge.id, s.challenge)
  })
  const challenges = Array.from(challengeMap.values())

  return (
    <div className="p-4 md:p-8 max-w-[100vw] overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gradebook (Buku Nilai)</h1>
          <p className="text-sm text-muted-foreground">Rekapitulasi nilai tantangan coding siswa.</p>
        </div>
        <Badge variant="outline" className="px-3 py-1 text-sm font-medium">{students.length} Siswa</Badge>
      </div>

      <Card className="overflow-hidden border-2 shadow-sm">
        <CardHeader className="bg-gray-50/50 border-b pb-4">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Rekapitulasi Nilai
            </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
            <div className="overflow-auto max-h-[70vh] relative">
                <Table>
                    <TableHeader className="bg-white sticky top-0 z-20 shadow-sm">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[250px] sticky left-0 z-30 bg-white border-r shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                              Siswa
                            </TableHead>
                            {challenges.length > 0 ? challenges.map((c: any) => (
                                <TableHead key={c.id} className="text-center min-w-[140px] px-4" scope="col">
                                    <div className="flex flex-col items-center justify-center h-full py-2">
                                      <span className="font-bold text-xs uppercase tracking-wider line-clamp-2 text-center">{c.title}</span>
                                      <Badge variant="secondary" className="mt-1 text-[10px] px-1.5 h-5">Max: {c.points}</Badge>
                                    </div>
                                </TableHead>
                            )) : (
                              <TableHead className="text-center italic text-muted-foreground">Belum ada submission</TableHead>
                            )}
                            <TableHead className="text-right min-w-[100px] sticky right-0 z-30 bg-white border-l shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]" scope="col">
                              Rata-rata
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {students.map((student: any) => {
                            let totalScore = 0
                            let count = 0

                            return (
                                <TableRow key={student.id} className="group hover:bg-gray-50/50">
                                    <TableCell className="font-medium sticky left-0 z-10 bg-white group-hover:bg-gray-50 border-r shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                                        <div className="flex items-center gap-3 py-1">
                                            <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                                                <AvatarImage src={student.avatar} alt={student.name} />
                                                <AvatarFallback className="bg-primary/10 text-primary font-bold">{student.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col min-w-0">
                                                <span className="truncate font-bold text-sm text-gray-900">{student.name}</span>
                                                <span className="truncate text-xs text-gray-500">{student.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    {challenges.length > 0 ? challenges.map((c: any) => {
                                        const sub = submissions.find((s: any) => s.userId === student.id && s.challengeId === c.id)
                                        const score = sub ? (sub.grade || (sub.passed ? 100 : 0)) : 0 // Default logic
                                        
                                        if (sub) {
                                            totalScore += score
                                            count++
                                        }

                                        return (
                                            <TableCell key={c.id} className="text-center p-0">
                                                <div className="h-full w-full py-3 flex items-center justify-center border-l border-transparent hover:border-gray-100">
                                                {sub ? (
                                                    <div className="flex flex-col items-center">
                                                        <span className={`text-sm font-black ${sub.passed ? 'text-green-600' : 'text-red-500'}`}>
                                                            {score}
                                                        </span>
                                                        <span className={`text-[9px] px-1.5 rounded-full mt-0.5 font-bold ${sub.grade ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                                            {sub.grade ? 'GRADED' : 'AUTO'}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-200 font-mono text-xl">·</span>
                                                )}
                                                </div>
                                            </TableCell>
                                        )
                                    }) : (
                                       <TableCell className="text-center text-gray-400">-</TableCell>
                                    )}
                                    <TableCell className="text-right font-bold sticky right-0 z-10 bg-white group-hover:bg-gray-50 border-l shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                                        <span className={`text-lg ${count > 0 ? 'text-primary' : 'text-gray-400'}`}>
                                          {count > 0 ? Math.round(totalScore / count) : 0}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  )
}
