'use client'

import { useState } from "react"
import { Badge } from "@/generated/prisma"
import { BadgeDialog } from "@/components/admin/badge-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit, Trash2 } from "lucide-react"
import { deleteBadge } from "@/app/actions/admin-badge-actions"
import { toast } from "sonner"

interface BadgeListProps {
  badges: Badge[]
  courses: { id: string; title: string }[]
}

export function BadgeList({ badges, courses }: BadgeListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedBadge, setSelectedBadge] = useState<Badge | undefined>(undefined)

  const handleCreate = () => {
    setSelectedBadge(undefined)
    setIsDialogOpen(true)
  }

  const handleEdit = (badge: Badge) => {
    setSelectedBadge(badge)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this badge?")) {
      const result = await deleteBadge(id)
      if (result.success) {
        toast.success("Badge deleted")
      } else {
        toast.error("Failed to delete badge")
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Badge Management</h2>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Create Badge
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map((badge) => (
          <Card key={badge.id} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="flex items-center gap-4">
                {badge.imageUrl.startsWith('data:image') || badge.imageUrl.startsWith('/') || badge.imageUrl.startsWith('http') ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={badge.imageUrl} alt={badge.name} className="w-12 h-12 object-cover rounded-full border border-gray-200" />
                ) : (
                    <div className="text-4xl">{badge.imageUrl}</div>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(badge)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(badge.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg mb-2">{badge.name}</CardTitle>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {badge.description}
              </p>
              
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="bg-secondary px-2 py-1 rounded-md">
                  {badge.category}
                </span>
                <span className="bg-secondary px-2 py-1 rounded-md">
                  {badge.xpReward} XP
                </span>
                <span className="bg-primary/10 text-primary px-2 py-1 rounded-md font-medium">
                  {badge.criteriaType.replace('_', ' ')}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {badges.length === 0 && (
          <div className="col-span-full text-center py-10 text-muted-foreground">
            No badges found. Create one to get started.
          </div>
        )}
      </div>

      <BadgeDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        badge={selectedBadge}
        courses={courses}
      />
    </div>
  )
}
