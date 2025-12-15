'use client'

import { CreateClassDialog } from "./create-class-dialog"

interface ClassData {
  id: string
  name: string
  code: string
  school: string | null
  mentor: {
    user: {
      name: string
      email: string
    }
  } | null
  _count: {
    students: number
  }
}

interface Mentor {
  id: string
  user: {
    name: string
  }
}

interface ClassListProps {
  classes: ClassData[]
  mentors: Mentor[]
}

export function ClassList({ classes, mentors }: ClassListProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">Manage student cohorts and assignments.</p>
        <CreateClassDialog mentors={mentors} />
      </div>

      <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/30 text-muted-foreground font-medium">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Code</th>
              <th className="p-4">School</th>
              <th className="p-4">Mentor</th>
              <th className="p-4 text-center">Students</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {classes.length === 0 ? (
               <tr>
                 <td colSpan={5} className="p-8 text-center text-muted-foreground">
                   No classes found. Create one to get started.
                 </td>
               </tr>
            ) : (
              classes.map((cls) => (
                <tr key={cls.id} className="hover:bg-muted/5 transition-colors">
                  <td className="p-4 font-medium text-base">{cls.name}</td>
                  <td className="p-4">
                    <span className="font-mono bg-secondary/10 px-2 py-1 rounded text-xs font-bold text-secondary">
                      {cls.code}
                    </span>
                  </td>
                  <td className="p-4">{cls.school || "-"}</td>
                  <td className="p-4">
                    {cls.mentor ? (
                      <div className="flex flex-col">
                        <span className="font-medium">{cls.mentor.user.name}</span>
                        <span className="text-xs text-muted-foreground">{cls.mentor.user.email}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic">Unassigned</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <div className="inline-flex items-center justify-center bg-erlass-primary/10 text-erlass-primary font-bold px-3 py-1 rounded-full">
                      {cls._count.students}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
