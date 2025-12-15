'use client'

import { useState } from "react"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BadgeDialog } from "@/components/admin/badge-dialog"
import { deleteBadge } from "@/app/actions/admin-badge-actions"
import { toast } from "sonner"

export function BadgeActions({ badge, courses }: { badge: any, courses: any[] }) {
    const [isEditOpen, setIsEditOpen] = useState(false)

    async function handleDelete() {
        if (!confirm("Hapus badge ini?")) return
        const res = await deleteBadge(badge.id)
        if (res.success) toast.success("Badge dihapus")
        else toast.error("Gagal menghapus badge")
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                    <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setIsEditOpen(true)} className="cursor-pointer">
                        <Edit className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDelete} className="cursor-pointer text-red-600 focus:bg-red-50">
                        <Trash2 className="mr-2 h-4 w-4" /> Hapus
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <BadgeDialog 
                badge={badge} 
                courses={courses} 
                open={isEditOpen} 
                onOpenChange={setIsEditOpen} 
            />
        </>
    )
}
