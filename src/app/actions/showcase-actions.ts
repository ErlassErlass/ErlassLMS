'use server'

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

interface ToggleShowcaseSubmissionProps {
  submissionId: string;
}

export async function toggleShowcaseSubmission({ submissionId }: ToggleShowcaseSubmissionProps) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    // Only SUPERADMIN can mark submissions as showcase
    if (session.user.role !== 'SUPERADMIN') {
      return { success: false, error: "Unauthorized" };
    }

    const existingSubmission = await prisma.challengeSubmission.findUnique({
      where: { id: submissionId },
      select: { isShowcase: true }
    });

    if (!existingSubmission) {
      return { success: false, error: "Submission not found" };
    }

    // Toggle the showcase status
    const updatedSubmission = await prisma.challengeSubmission.update({
      where: { id: submissionId },
      data: {
        isShowcase: !existingSubmission.isShowcase
      }
    });

    // Revalidate the showcases page
    revalidatePath('/dashboard/showcases');
    
    return { 
      success: true, 
      message: updatedSubmission.isShowcase ? "Submission marked as showcase!" : "Submission removed from showcase.", 
      isShowcase: updatedSubmission.isShowcase 
    };
  } catch (error) {
    console.error("Error toggling showcase status:", error);
    return { success: false, error: "An error occurred" };
  }
}

export async function getShowcaseSubmissions() {
  try {
    const submissions = await prisma.challengeSubmission.findMany({
      where: {
        isShowcase: true,
        passed: true,
      },
      include: {
        user: {
          select: {
            name: true,
            avatar: true,
            xp: true,
            level: true
          }
        },
        challenge: {
          select: {
            title: true,
            description: true,
            category: true,
            difficulty: true,
            points: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    });

    return submissions;
  } catch (error) {
    console.error("Error fetching showcase submissions:", error);
    return [];
  }
}