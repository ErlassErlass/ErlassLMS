import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { listBackupsAction } from "@/app/actions/backup-actions"
import BackupClient from "./backup-client"

export default async function BackupPage() {
    const session = await getServerSession(authOptions)
    if (session?.user.role !== 'SUPERADMIN') redirect('/dashboard')

    const backups = await listBackupsAction()

    return (
        <div className="px-4 sm:px-6 lg:px-8 pb-12 max-w-5xl mx-auto">
            <BackupClient initialBackups={backups} />
        </div>
    )
}
