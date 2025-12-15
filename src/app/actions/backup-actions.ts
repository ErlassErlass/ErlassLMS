'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { generateBackup } from "@/lib/backup-service"
import { revalidatePath } from "next/cache"
import fs from 'fs/promises'
import path from 'path'

export async function createBackupAction() {
    const session = await getServerSession(authOptions)
    if (session?.user.role !== 'SUPERADMIN') return { error: "Unauthorized" }

    try {
        const result = await generateBackup()
        return result
    } catch (error) {
        return { error: "Failed to generate backup" }
    }
}

export async function listBackupsAction() {
    const session = await getServerSession(authOptions)
    if (session?.user.role !== 'SUPERADMIN') return []

    const backupDir = path.join(process.cwd(), 'public', 'backups')
    try {
        const files = await fs.readdir(backupDir)
        // Get stats
        const backups = await Promise.all(files.map(async (file) => {
            const stats = await fs.stat(path.join(backupDir, file))
            return {
                name: file,
                size: stats.size,
                createdAt: stats.birthtime,
                url: `/backups/${file}`
            }
        }))
        return backups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    } catch (e) {
        return []
    }
}

export async function deleteBackupAction(filename: string) {
    const session = await getServerSession(authOptions)
    if (session?.user.role !== 'SUPERADMIN') return { error: "Unauthorized" }

    try {
        const filepath = path.join(process.cwd(), 'public', 'backups', filename)
        await fs.unlink(filepath)
        revalidatePath('/dashboard/admin/backup')
        return { success: true }
    } catch (error) {
        return { error: "Failed to delete file" }
    }
}
