'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export type ShopItem = {
  id: string
  name: string
  description: string
  cost: number
  type: 'FRAME' | 'THEME' | 'TITLE'
  assetUrl: string
  isPremium: boolean
  purchased?: boolean
  active?: boolean
}

export async function getShopItems() {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id

  try {
    // Fetch all items
    const items: any[] = await prisma.$queryRaw`SELECT * FROM shop_items ORDER BY cost ASC`
    
    // Fetch user inventory if logged in
    let inventory: any[] = []
    if (userId) {
        inventory = await prisma.$queryRaw`SELECT * FROM user_inventory WHERE "userId" = ${userId}`
    }

    // Map to include purchased status
    const mappedItems = items.map((item) => {
        const owned = inventory.find((inv) => inv.shopItemId === item.id)
        return {
            ...item,
            purchased: !!owned,
            active: owned ? owned.isActive : false
        }
    })

    return { success: true, data: mappedItems }
  } catch (error) {
    console.error("Get Shop Items Error:", error)
    return { success: false, error: "Gagal memuat item shop." }
  }
}

export async function buyItem(itemId: string) {
  const session = await getServerSession(authOptions)
  if (!session) return { success: false, error: "Unauthorized" }

  const userId = session.user.id

  try {
    // 1. Get Item Details
    const items: any[] = await prisma.$queryRaw`SELECT * FROM shop_items WHERE id = ${itemId} LIMIT 1`
    const item = items[0]
    if (!item) return { success: false, error: "Item tidak ditemukan" }

    // 2. Check Ownership
    const owned: any[] = await prisma.$queryRaw`SELECT * FROM user_inventory WHERE "userId" = ${userId} AND "shopItemId" = ${itemId}`
    if (owned.length > 0) return { success: false, error: "Anda sudah memiliki item ini" }

    // 3. Check XP (User Balance)
    // We need to fetch user manually since session might be stale
    const users: any[] = await prisma.$queryRaw`SELECT xp FROM users WHERE id = ${userId}`
    const userXp = users[0]?.xp || 0

    if (userXp < item.cost) {
        return { success: false, error: `XP tidak cukup. Butuh ${item.cost} XP.` }
    }

    // 4. Transaction (Manual)
    // A. Deduct XP
    await prisma.$executeRaw`UPDATE users SET xp = xp - ${item.cost} WHERE id = ${userId}`
    
    // B. Add to Inventory
    const invId = `inv_${Math.random().toString(36).substring(2, 15)}`
    await prisma.$executeRaw`
        INSERT INTO user_inventory (id, "userId", "shopItemId", "purchasedAt", "isActive")
        VALUES (${invId}, ${userId}, ${itemId}, NOW(), false)
    `

    revalidatePath('/dashboard/shop')
    revalidatePath('/dashboard/profile')
    return { success: true, message: `Berhasil membeli ${item.name}!` }

  } catch (error) {
    console.error("Buy Item Error:", error)
    return { success: false, error: "Gagal memproses pembelian." }
  }
}

export async function equipItem(itemId: string, type: string) {
  const session = await getServerSession(authOptions)
  if (!session) return { success: false, error: "Unauthorized" }

  const userId = session.user.id

  try {
    // 1. Verify Ownership
    const owned: any[] = await prisma.$queryRaw`SELECT * FROM user_inventory WHERE "userId" = ${userId} AND "shopItemId" = ${itemId}`
    if (owned.length === 0) return { success: false, error: "Item tidak dimiliki" }

    // 2. Unequip all items of same type
    // We need to join with shop_items to check type, but simpler logic:
    // Just find all inventory items for this user that map to shop_items of this type
    
    // Complex query needed to disable others
    await prisma.$executeRaw`
        UPDATE user_inventory 
        SET "isActive" = false 
        WHERE "userId" = ${userId} 
        AND "shopItemId" IN (SELECT id FROM shop_items WHERE type = ${type}::"ShopItemType")
    `

    // 3. Equip target
    await prisma.$executeRaw`
        UPDATE user_inventory 
        SET "isActive" = true 
        WHERE "userId" = ${userId} AND "shopItemId" = ${itemId}
    `

    revalidatePath('/dashboard/shop')
    revalidatePath('/dashboard/profile')
    return { success: true, message: "Item digunakan!" }

  } catch (error) {
    console.error("Equip Item Error:", error)
    return { success: false, error: "Gagal menggunakan item." }
  }
}
