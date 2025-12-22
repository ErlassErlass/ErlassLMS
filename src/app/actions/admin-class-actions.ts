'use server'

import { getServerSession, Session } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
// Removed explicit type imports to rely on inferred Prisma types or 'any' for now to solve build
// import { User, ChallengeSubmission, ClassAnnouncement } from "@prisma/client"

// --- Types ---
type ActionResponse<T = undefined> = {
    success: boolean
    error?: string
    data?: T
}

type GradebookData = {
    students: any[]
    submissions: any[]
}

// --- Authorized Wrappers ---

/**
 * Higher-order function to handle authentication and error handling.
 * Principle: DRY - Authentication logic defined once.
 */
async function withAuth<T>(
    action: (session: Session) => Promise<ActionResponse<T>>, 
    requireAdmin: boolean = false
): Promise<ActionResponse<T>> {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) return { success: false, error: "Unauthorized" }
        
        if (requireAdmin && session.user.role !== 'SUPERADMIN') {
            return { success: false, error: "Forbidden: Admin access required" }
        }

        return await action(session)
    } catch (error) {
        console.error("Action error:", error)
        return { success: false, error: "An unexpected error occurred" }
    }
}

// --- Actions ---

export async function getClassGradebook(classId: string): Promise<ActionResponse<GradebookData>> {
    return withAuth(async (session) => {
        const classData = await prisma.class.findUnique({
            where: { id: classId },
            include: { mentor: true }
        })

        if (!classData) return { success: false, error: "Class not found" }
        
        // Authorization Check: Must be Admin OR the Mentor of the class
        const isMentor = classData.mentor?.userId === session.user.id
        const isAdmin = session.user.role === 'SUPERADMIN'

        if (!isMentor && !isAdmin) {
            return { success: false, error: "Forbidden: You are not the mentor of this class" }
        }

        const students = await fetchClassStudents(classId)
        const submissions = await fetchSubmissionsForStudents(students.map(s => s.id))

        return { success: true, data: { students, submissions } }
    })
}

export async function gradeSubmission(submissionId: string, grade: number, feedback: string): Promise<ActionResponse> {
    return withAuth(async (session) => {
        try {
            // Security: Ensure the mentor owns the student's class (or is admin)
            const submission = await prisma.challengeSubmission.findUnique({
                where: { id: submissionId },
                include: { user: { include: { class: { include: { mentor: true } } } } }
            })

            if (!submission) return { success: false, error: "Submission not found" }

            const isAdmin = session.user.role === 'SUPERADMIN'
            const isMentorOfClass = submission.user?.class?.mentor?.userId === session.user.id
            
            // Allow if Admin or if Mentor of the specific class
            if (!isAdmin && !isMentorOfClass) {
                 return { success: false, error: "Forbidden: You can only grade students in your assigned class" }
            }

            await prisma.challengeSubmission.update({
                where: { id: submissionId },
                data: {
                    grade,
                    feedback,
                    gradedBy: session.user.id
                }
            })
            revalidatePath('/dashboard/admin/classes')
            return { success: true }
        } catch (error) {
            console.error("Grade error:", error)
            return { success: false, error: "Failed to save grade" }
        }
    })
}

export async function createAnnouncement(classId: string, title: string, content: string): Promise<ActionResponse> {
    return withAuth(async (session) => {
        try {
            await prisma.classAnnouncement.create({
                data: {
                    classId,
                    title,
                    content,
                    authorId: session.user.id
                }
            })
            revalidatePath(`/dashboard/admin/classes/${classId}`)
            return { success: true }
        } catch (error) {
             console.error("Announcement error:", error)
            return { success: false, error: "Failed to create announcement" }
        }
    })
}

export async function getAnnouncements(classId: string): Promise<ActionResponse<any[]>> {
    return withAuth(async () => {
        const data = await prisma.classAnnouncement.findMany({
            where: { classId },
            include: { author: { select: { name: true, role: true } } },
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, data }
    })
}

export async function createClass(formData: FormData): Promise<ActionResponse> {
    return withAuth(async () => {
        const name = formData.get('name') as string
        const code = formData.get('code') as string
        const mentorId = formData.get('mentorId') as string

        if (!name || !code) return { success: false, error: "Name and Code are required" }

        try {
            await prisma.class.create({
                data: {
                    name,
                    code,
                    mentorId: mentorId || null
                }
            })
            revalidatePath('/dashboard/admin/classes')
            return { success: true }
        } catch (error) {
             console.error("Create class error:", error)
            return { success: false, error: "Gagal membuat kelas" }
        }
    }, true) // requireAdmin
}

export async function deleteClass(id: string): Promise<ActionResponse> {
    return withAuth(async () => {
        try {
            await prisma.class.delete({ where: { id } })
            revalidatePath('/dashboard/admin/classes')
            return { success: true }
        } catch (error) {
            console.error("Delete class error:", error) 
            return { success: false, error: "Gagal menghapus kelas" }
        }
    }, true) // requireAdmin
}

// --- Helpers ---

async function fetchClassStudents(classId: string) {
    return prisma.user.findMany({
        where: { classId: classId },
        select: { id: true, name: true, email: true, avatar: true }
    })
}

async function fetchSubmissionsForStudents(studentIds: string[]) {
    if (studentIds.length === 0) return []
    
    return prisma.challengeSubmission.findMany({
        where: {
            userId: { in: studentIds }
        },
        include: {
            challenge: { select: { id: true, title: true, points: true } }
        }
    })
}
