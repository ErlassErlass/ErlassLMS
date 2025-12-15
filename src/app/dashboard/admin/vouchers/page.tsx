
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Ticket, Calendar } from "lucide-react"
import { redirect } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createVoucher, deleteVoucher } from "@/app/actions/admin-voucher-actions"
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
import { Badge } from "@/components/ui/badge"
import { BulkVoucherDialog } from "@/components/admin/bulk-voucher-dialog"

export default async function AdminVouchersPage() {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'SUPERADMIN') redirect('/dashboard')

  const vouchers = await prisma.voucher.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#1F2937] dark:text-white">Voucher Diskon</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Kelola kode promo untuk siswa.</p>
        </div>
        
        <div className="flex items-center gap-2">
        <BulkVoucherDialog />

        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-[#FF5656] hover:bg-[#CC0000] text-white font-bold rounded-xl shadow-md">
                <Plus className="mr-2 h-4 w-4" /> Buat Voucher
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] rounded-2xl">
            <DialogHeader>
              <DialogTitle>Buat Voucher Baru</DialogTitle>
              <DialogDescription>Isi detail voucher diskon di bawah ini.</DialogDescription>
            </DialogHeader>
            <form action={createVoucher as any} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="code">Kode Voucher</Label>
                <Input id="code" name="code" placeholder="CONTOH: PROMO2025" required className="uppercase" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Input id="description" name="description" placeholder="Diskon Awal Tahun" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="discountType">Tipe Diskon</Label>
                    <select name="discountType" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option value="PERCENTAGE">Persentase (%)</option>
                        <option value="FIXED">Nominal (Rp)</option>
                    </select>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="discountValue">Nilai</Label>
                    <Input type="number" id="discountValue" name="discountValue" placeholder="10 atau 50000" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="maxUsage">Kuota</Label>
                    <Input type="number" id="maxUsage" name="maxUsage" defaultValue="100" />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="minPurchase">Min. Belanja</Label>
                    <Input type="number" id="minPurchase" name="minPurchase" defaultValue="0" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expiresAt">Kadaluarsa (Opsional)</Label>
                <Input type="date" id="expiresAt" name="expiresAt" />
              </div>
              <Button type="submit" className="bg-[#FF5656] text-white font-bold rounded-lg mt-2">
                Simpan Voucher
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                <th className="p-6 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kode</th>
                <th className="p-6 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Diskon</th>
                <th className="p-6 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kuota</th>
                <th className="p-6 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kadaluarsa</th>
                <th className="p-6 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {vouchers.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                            <Ticket className="h-4 w-4" />
                        </div>
                        <div>
                            <div className="font-bold text-[#1F2937] dark:text-white">{v.code}</div>
                            <div className="text-xs text-gray-500">{v.description}</div>
                        </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-none">
                        {v.discountType === 'PERCENTAGE' ? `${v.discountValue}%` : `Rp ${v.discountValue.toLocaleString()}`}
                    </Badge>
                  </td>
                  <td className="p-6 text-sm text-gray-600 dark:text-gray-300">
                    {v.usedCount} / {v.maxUsage}
                  </td>
                  <td className="p-6 text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {v.expiresAt ? new Date(v.expiresAt).toLocaleDateString('id-ID') : 'Selamanya'}
                  </td>
                  <td className="p-6 text-right">
                    <form action={deleteVoucher.bind(null, v.id) as any}>
                        <Button size="icon" variant="ghost" className="text-red-500 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </form>
                  </td>
                </tr>
              ))}
              {vouchers.length === 0 && (
                <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                        Belum ada voucher.
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
