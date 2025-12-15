import { prisma } from "@/lib/db";

export class CertificateService {
  /**
   * Issues a certificate for a user if they don't already have one for this course/challenge.
   * Enforces Clean Code: specific purpose, clear naming.
   */
  static async issueCertificate(userId: string, type: 'COURSE' | 'CHALLENGE', referenceId: string) {
    // 1. Check for existing certificate to prevent duplicates (Idempotency)
    const existing = await prisma.certificate.findFirst({
      where: {
        userId,
        type,
        [type === 'COURSE' ? 'courseId' : 'challengeId']: referenceId,
      },
    });

    if (existing) {
      return existing; // Return existing if found
    }

    // 2. Generate Serial Number
    const serialNumber = await this.generateUniqueSerialNumber(type);

    // 3. Create Certificate
    // Note: We let Prisma handle the 'id' (cuid) automatically unless there's a specific reason to override.
    return await prisma.certificate.create({
      data: {
        userId,
        type,
        serialNumber,
        [type === 'COURSE' ? 'courseId' : 'challengeId']: referenceId,
        metadata: {
          issuedBy: 'SYSTEM',
          issuedAt: new Date().toISOString(),
        },
      },
    });
  }

  /**
   * Generates a unique serial number with ERL prefix.
   * Format: ERL-{YYYY}-{TYPE}-{RANDOM}
   */
  private static async generateUniqueSerialNumber(type: 'COURSE' | 'CHALLENGE' | 'ACHIEVEMENT'): Promise<string> {
    const year = new Date().getFullYear();
    const typeCode = type === 'COURSE' ? 'CRS' : type === 'CHALLENGE' ? 'CHG' : 'ACH';
    
    // Retry loop to ensure uniqueness
    while (true) {
        // Using a longer random string or timestamp component to minimize collisions
        const random = Math.random().toString(36).substring(2, 8).toUpperCase(); // ~6 chars
        const serial = `ERL-${year}-${typeCode}-${random}`;
        
        const exists = await prisma.certificate.findUnique({
            where: { serialNumber: serial }
        });

        if (!exists) return serial;
    }
  }

  /**
   * Checks requirements and issues certificate if met.
   * Used by progress triggers.
   */
  static async checkAndIssueCourseCertificate(userId: string, courseId: string) {
    // Verify progress again (Double check pattern)
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    // Ensure strictly 100% progress
    if (enrollment && enrollment.progressPercentage >= 100) {
      return await this.issueCertificate(userId, 'COURSE', courseId);
    }

    return null;
  }
}
