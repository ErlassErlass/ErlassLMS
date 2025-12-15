"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Home, 
  BookOpen, 
  Trophy, 
  Users, 
  Settings,
  Menu,
  X,
  LogOut,
  FileText,
  BarChart3,
  User,
  Layers,
  Ticket,
  ShoppingBag,
  Flame
} from "lucide-react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Kursus Saya', href: '/dashboard/courses', icon: BookOpen },
  { name: 'Tantangan', href: '/dashboard/challenges', icon: Trophy },
  { name: 'Leaderboard', href: '/dashboard/leaderboard', icon: Users },
  { name: 'XP Shop', href: '/dashboard/shop', icon: ShoppingBag },
  { name: 'Profil Saya', href: '/dashboard/profile', icon: User },
  { name: 'Pengaturan', href: '/dashboard/settings', icon: Settings },
]

export default function DashboardNav({ user }: { user: any }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Admin navigation items - only shown for superadmins
  const adminNavigation = user.role === 'SUPERADMIN' ? [
    { name: 'Manajemen Kursus', href: '/dashboard/admin/courses', icon: BookOpen },
    { name: 'Kategori', href: '/dashboard/admin/categories', icon: Layers },
    { name: 'Manajemen Tantangan', href: '/dashboard/admin/challenges', icon: Trophy },
    { name: 'Voucher', href: '/dashboard/admin/vouchers', icon: Ticket },
    { name: 'Bank Soal', href: '/dashboard/admin/question-banks', icon: FileText },
    { name: 'Analytics', href: '/dashboard/admin/analytics', icon: BarChart3 },
  ] : []

  // Combine regular navigation with admin navigation
  const allNavigation = [...navigation, ...adminNavigation]

  return (
    <>
      {/* Mobile sidebar */}
      <div className={cn(
        "lg:hidden fixed inset-0 z-50 bg-secondary/80 backdrop-blur-sm transition-opacity",
        sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-white transform transition-transform shadow-2xl",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-xl shadow-lg flex items-center justify-center text-secondary font-bold text-xl transform rotate-3">
                E
              </div>
              <span className="text-2xl font-black tracking-tight text-secondary">Erlass</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
          
          <nav className="mt-8 px-4 space-y-2">
            {allNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200",
                  pathname === item.href 
                    ? "bg-secondary/10 text-secondary shadow-sm" 
                    : "text-gray-600 hover:bg-tertiary/5 hover:text-tertiary hover:translate-x-1"
                )}
              >
                <item.icon className={cn("h-5 w-5", pathname === item.href ? "text-secondary" : "text-gray-400 group-hover:text-tertiary")} />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-100 bg-white/80 backdrop-blur-xl px-6 pb-4 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
          <div className="flex h-24 shrink-0 items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-xl shadow-lg flex items-center justify-center text-secondary font-bold text-xl transform rotate-3 hover:rotate-0 transition-all duration-300">
                E
              </div>
              <span className="text-2xl font-black tracking-tight text-secondary">Erlass</span>
            </div>
          </div>
          
          <nav className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul className="-mx-2 space-y-2">
                  {allNavigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center space-x-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 group",
                          pathname === item.href 
                            ? "bg-secondary/10 text-secondary shadow-sm border border-secondary/20" 
                            : "text-gray-600 hover:bg-tertiary/5 hover:translate-x-1"
                        )}
                      >
                        <item.icon className={cn(
                          "h-5 w-5 transition-colors", 
                          pathname === item.href ? "text-secondary" : "text-gray-400 group-hover:text-tertiary"
                        )} />
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              
              <li className="mt-auto">
                <div className="flex items-center space-x-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="h-10 w-10 bg-tertiary rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white text-sm font-bold">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-secondary truncate">{user.name}</p>
                    <p className="text-xs font-medium text-gray-500 capitalize">{user.role}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => signOut()}
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg h-8 w-8 p-0"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content area */}
      <div className="lg:pl-72">
        <div className="sticky top-0 z-40 flex h-20 shrink-0 items-center gap-x-4 border-b border-gray-100 bg-white/80 backdrop-blur-md px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 transition-all">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden hover:bg-gray-100 rounded-lg"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="relative flex flex-1 items-center">
               <h2 className="text-lg font-bold text-secondary hidden sm:block">
                 Dashboard Pembelajaran
               </h2>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              
              {/* STREAK INDICATOR */}
              <div id="streak-indicator" className="flex items-center gap-1 bg-orange-100 px-3 py-1 rounded-full border border-orange-200" title="Daily Streak">
                <Flame className="h-5 w-5 text-orange-500 fill-orange-500 animate-pulse" />
                <span className="font-black text-orange-700">{user.currentStreak || 0}</span>
              </div>

              <div className="hidden lg:block lg:h-8 lg:w-px lg:bg-gray-200" />
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-bold text-secondary">{user.name}</p>
                  <p className="text-xs text-gray-500 font-semibold capitalize bg-gray-100 px-2 py-0.5 rounded-full inline-block mt-0.5">{user.role}</p>
                </div>
                <div className="h-10 w-10 bg-tertiary rounded-full flex items-center justify-center shadow-md border-2 border-white">
                  <span className="text-white text-sm font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
