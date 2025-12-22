
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Users, User, BookOpenCheck } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createClass, deleteClass } from "@/app/actions/admin-class-actions"

export default async function AdminClassesPage() {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'SUPERADMIN') redirect('/dashboard')

  const classes = await prisma.class.findMany({
    include: {
      mentor: {
        include: { user: true }
      },
      _count: {
        select: { students: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  const mentors = await prisma.mentor.findMany({
    include: { user: true }
  })

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-secondary">Manajemen Kelas</h1>
          <p className="text-gray-600 mt-1">Kelola kelompok belajar dan assign mentor.</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-md">
                <Plus className="mr-2 h-4 w-4" /> Buat Kelas Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] rounded-2xl">
            <DialogHeader>
              <DialogTitle>Buat Kelas Baru</DialogTitle>
              <DialogDescription>Isi detail kelas dan pilih mentor.</DialogDescription>
            </DialogHeader>
            <form action={createClass as any} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nama Kelas</Label>
                <Input id="name" name="name" placeholder="Contoh: X-A Robotika" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="code">Kode Kelas (Unik)</Label>
                <Input id="code" name="code" placeholder="ROBO-SMAN1" required className="uppercase" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mentorId">Mentor (Opsional)</Label>
                <select name="mentorId" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="">-- Pilih Mentor --</option>
                    {mentors.map((m) => (
                        <option key={m.id} value={m.id}>{m.user.name} ({m.user.email})</option>
                    ))}
                </select>
              </div>
              <Button type="submit" className="bg-primary text-white font-bold rounded-lg mt-2">
                Simpan Kelas
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="p-6 text-sm font-bold text-gray-500 uppercase tracking-wider">Nama Kelas</th>
                <th className="p-6 text-sm font-bold text-gray-500 uppercase tracking-wider">Kode</th>
                <th className="p-6 text-sm font-bold text-gray-500 uppercase tracking-wider">Mentor</th>
                <th className="p-6 text-sm font-bold text-gray-500 uppercase tracking-wider">Jumlah Siswa</th>
                <th className="p-6 text-sm font-bold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {classes.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-6 font-bold text-secondary">
                    {c.name}
                  </td>
                  <td className="p-6">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-mono font-bold">
                        {c.code}
                    </span>
                  </td>
                  <td className="p-6">
                    {c.mentor ? (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="h-4 w-4 text-primary" />
                            {c.mentor.user.name}
                        </div>
                    ) : (
                        <span className="text-gray-400 text-sm italic">Belum ada</span>
                    )}
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                        <Users className="h-4 w-4" />
                        {c._count.students}
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                        <Link href={`/dashboard/admin/classes/${c.id}`}>
                             <Button variant="default" size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700">
                                <Users className="h-4 w-4" /> Detail
                            </Button>
                        </Link>
                        <Link href={`/dashboard/admin/classes/${c.id}/gradebook`}>
                            <Button variant="outline" size="sm" className="gap-2">
                                <BookOpenCheck className="h-4 w-4" /> Nilai
                            </Button>
                        </Link>
                        <form action={deleteClass.bind(null, c.id) as any}>
                            <Button size="icon" variant="ghost" className="text-red-500 hover:bg-red-50">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                  </td>
                </tr>
              ))}
              {classes.length === 0 && (
                <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                        Belum ada kelas yang dibuat.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
