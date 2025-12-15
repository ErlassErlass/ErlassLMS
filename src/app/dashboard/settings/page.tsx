
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { User, Mail, Lock, Bell, LogOut } from "lucide-react"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-12">
      <div className="mb-8 bg-gray-100 dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl font-black text-[#1F2937] dark:text-white mb-2">Pengaturan Akun ⚙️</h1>
        <p className="text-gray-600 dark:text-gray-300 font-medium">
          Kelola profil dan preferensi kamu di sini.
        </p>
      </div>

      <div className="grid gap-8 max-w-3xl">
        {/* Profile Section */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border-2 border-gray-100 dark:border-gray-700 shadow-sm">
          <h2 className="text-xl font-bold text-[#1F2937] dark:text-white mb-6 flex items-center gap-2">
            <User className="h-5 w-5 text-tertiary" />
            Profil Saya
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-md">
                {session.user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <Button variant="outline" className="rounded-xl">Ubah Foto</Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Nama Lengkap</label>
                <input 
                  type="text" 
                  defaultValue={session.user.name || ''} 
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:border-[#8CE4FF] outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email
                </label>
                <input 
                  type="email" 
                  defaultValue={session.user.email || ''} 
                  disabled
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border-2 border-gray-100 dark:border-gray-700 shadow-sm">
          <h2 className="text-xl font-bold text-[#1F2937] dark:text-white mb-6 flex items-center gap-2">
            <Lock className="h-5 w-5 text-[#FFA239]" />
            Keamanan
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-2xl">
              <div>
                <p className="font-bold text-[#1F2937] dark:text-white">Password</p>
                <p className="text-sm text-gray-500">Terakhir diubah 3 bulan yang lalu</p>
              </div>
              <Button variant="outline" className="rounded-xl">Ubah Password</Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
            <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                <LogOut className="h-4 w-4 mr-2" />
                Keluar
            </Button>
            <Button className="bg-[#1F2937] dark:bg-white text-white dark:text-black font-bold px-8 rounded-xl">
                Simpan Perubahan
            </Button>
        </div>
      </div>
    </div>
  )
}
