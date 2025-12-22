
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { GenerateCodeDialog } from "@/components/admin/generate-code-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default async function AdminVouchersPage() {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'SUPERADMIN') redirect('/dashboard')

  // Fetch only Access Codes (Bundles)
  const vouchers = await prisma.voucher.findMany({
    where: { type: 'ACCESS_CODE' },
    include: {
      courses: { select: { title: true } },
      _count: { select: { transactions: true } } // Approx used count check
    },
    orderBy: { createdAt: 'desc' }
  })

  // Fetch all courses for selection
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    select: { id: true, title: true }
  })

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-secondary">Manajemen Kode Akses</h1>
          <p className="text-gray-600 mt-1">Generate kode bundling untuk sekolah atau kerjasama.</p>
        </div>
        <GenerateCodeDialog courses={courses} />
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead>Kode</TableHead>
              <TableHead>Kursus Terbuka</TableHead>
              <TableHead>Kuota</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Dibuat</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vouchers.map((v) => (
              <TableRow key={v.id}>
                <TableCell className="font-mono font-bold text-lg">{v.code}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {v.courses.map((c, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {c.title}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                    <div className="flex items-center gap-2">
                        <span className="font-bold">{v.usedCount}</span>
                        <span className="text-gray-400">/</span>
                        <span>{v.maxUsage}</span>
                    </div>
                    <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                        <div 
                            className="h-full bg-blue-500" 
                            style={{ width: `${Math.min((v.usedCount / v.maxUsage) * 100, 100)}%` }}
                        />
                    </div>
                </TableCell>
                <TableCell>
                    {v.isActive ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Aktif</Badge>
                    ) : (
                        <Badge variant="destructive">Nonaktif</Badge>
                    )}
                </TableCell>
                <TableCell className="text-right text-sm text-gray-500">
                    {new Date(v.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
            {vouchers.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        Belum ada kode akses yang dibuat.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
