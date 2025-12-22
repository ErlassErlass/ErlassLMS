'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClass } from "@/app/actions/admin-class-actions"
import { toast } from "sonner"
import { Plus } from "lucide-react"

interface Mentor {
  id: string
  user: {
    name: string
  }
}

interface CreateClassDialogProps {
  mentors: Mentor[]
}

export function CreateClassDialog({ mentors }: CreateClassDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [school, setSchool] = useState("")
  const [mentorId, setMentorId] = useState<string>("unassigned")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('code', code)
      if (mentorId !== 'unassigned') formData.append('mentorId', mentorId)
      if (school) formData.append('school', school)

      const res = await createClass(formData)
      if (res.success) {
        toast.success("Class created successfully")
        setOpen(false)
        setName("")
        setCode("")
        setSchool("")
        setMentorId("unassigned")
      } else {
        toast.error(res.error || "Failed to create class")
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-erlass-primary hover:bg-erlass-primary/90 text-white">
          <Plus className="mr-2 h-4 w-4" /> Create Class
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Class</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Class Name</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g. Batch 1 - 2025" 
              required 
            />
          </div>
          <div>
            <Label htmlFor="code">Class Code (Unique)</Label>
            <Input 
              id="code" 
              value={code} 
              onChange={(e) => setCode(e.target.value)} 
              placeholder="e.g. BAT1-2025" 
              required 
            />
          </div>
          <div>
            <Label htmlFor="school">School (Optional)</Label>
            <Input 
              id="school" 
              value={school} 
              onChange={(e) => setSchool(e.target.value)} 
              placeholder="e.g. SMA 1 Jakarta" 
            />
          </div>
          <div>
            <Label htmlFor="mentor">Assign Mentor</Label>
            <Select value={mentorId} onValueChange={setMentorId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a mentor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {mentors.map((mentor) => (
                  <SelectItem key={mentor.id} value={mentor.id}>
                    {mentor.user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Class"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
