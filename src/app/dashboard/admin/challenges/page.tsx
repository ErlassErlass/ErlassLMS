
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, Code, Eye, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { deleteChallenge } from "@/app/actions/admin-challenge-actions"

export default async function AdminChallengesPage() {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'SUPERADMIN') redirect('/dashboard')

  const challenges = await prisma.challenge.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { submissions: true }
      }
    }
  })

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#1F2937] dark:text-white">Manajemen Tantangan</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Buat soal koding, web, atau scratch.</p>
        </div>
        <Link href="/dashboard/admin/challenges/new">
          <Button className="bg-[#FF5656] hover:bg-[#CC0000] text-white font-bold rounded-xl shadow-md">
            <Plus className="mr-2 h-4 w-4" /> Buat Tantangan
          </Button>
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                <th className="p-6 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Judul</th>
                <th className="p-6 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kategori</th>
                <th className="p-6 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="p-6 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Poin</th>
                <th className="p-6 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Submission</th>
                <th className="p-6 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {challenges.map((challenge) => (
                <tr key={challenge.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 shrink-0">
                        <Code className="h-5 w-5" />
                      </div>
                      <div className="font-bold text-[#1F2937] dark:text-white">{challenge.title}</div>
                    </div>
                  </td>
                  <td className="p-6">
                    <Badge variant="outline" className="capitalize">
                        {challenge.category}
                    </Badge>
                  </td>
                  <td className="p-6">
                    {challenge.published ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none">Published</Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-500 border-gray-300">Draft</Badge>
                    )}
                  </td>
                  <td className="p-6 font-bold text-[#FF5656]">
                    {challenge.points} XP
                  </td>
                  <td className="p-6 text-[#1F2937] dark:text-white">
                    {challenge._count.submissions}
                  </td>
                  <td className="p-6 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                        <Link href={`/dashboard/admin/challenges/${challenge.id}`}>
                          <DropdownMenuItem className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" /> Edit Tantangan
                          </DropdownMenuItem>
                        </Link>
                        <Link href={`/dashboard/challenges/${challenge.id}`} target="_blank">
                          <DropdownMenuItem className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" /> Lihat Preview
                          </DropdownMenuItem>
                        </Link>
                        <form action={deleteChallenge.bind(null, challenge.id) as any}>
                          <button type="submit" className="w-full text-left">
                            <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                              <Trash2 className="mr-2 h-4 w-4" /> Hapus
                            </DropdownMenuItem>
                          </button>
                        </form>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
