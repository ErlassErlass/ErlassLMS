
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getShopItems, buyItem, equipItem } from "@/app/actions/shop-actions"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Star, Zap, Shield, Layout } from "lucide-react"
import { prisma } from "@/lib/db" // Used for XP check only
import { ShopClient } from "@/components/shop/shop-client"
import { SpinWheel } from "@/components/shop/SpinWheel"

export default async function ShopPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  // Fetch items
  const { data: items, error } = await getShopItems()
  
  // Fetch current user XP for display
  // Need raw query because client might be outdated
  const users: any[] = await prisma.$queryRaw`SELECT xp FROM users WHERE id = ${session.user.id}`
  const userXp = users[0]?.xp || 0

  if (error) return <div>Error loading shop: {error}</div>

  const frames = items?.filter((i: any) => i.type === 'FRAME') || []
  const titles = items?.filter((i: any) => i.type === 'TITLE') || []

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-3xl font-black text-secondary flex items-center gap-3">
                <ShoppingBag className="h-8 w-8 text-secondary" />
                XP Shop
            </h1>
            <p className="text-gray-600 mt-1">Tukar XP hasil belajarmu dengan item keren!</p>
        </div>
        <div className="bg-yellow-100 border-2 border-yellow-200 px-6 py-3 rounded-2xl flex items-center gap-3">
            <div className="bg-yellow-500 p-2 rounded-full text-white">
                <Zap className="h-5 w-5" />
            </div>
            <div>
                <p className="text-xs font-bold text-yellow-700 uppercase">Saldo Kamu</p>
                <p className="text-2xl font-black text-yellow-800">{userXp} XP</p>
            </div>
        </div>
      </div>

      {/* DAILY SPIN WHEEL */}
      <div className="mb-12">
        <SpinWheel />
      </div>

      {/* FRAMES SECTION */}
      <div className="mb-12">
        <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
            <Layout className="h-6 w-6 text-purple-500" />
            Avatar Frames
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {frames.map((item: any) => (
                <ShopClient key={item.id} item={item} userXp={userXp} />
            ))}
        </div>
      </div>

      {/* TITLES SECTION */}
      <div>
        <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
            <Star className="h-6 w-6 text-orange-500" />
            Titles & Julukan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {titles.map((item: any) => (
                <ShopClient key={item.id} item={item} userXp={userXp} />
            ))}
        </div>
      </div>
    </div>
  )
}
