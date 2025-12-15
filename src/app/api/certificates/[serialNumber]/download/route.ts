import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateCertificatePDF } from "@/lib/pdf/certificate-generator";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ serialNumber: string }> }
) {
  try {
    const params = await props.params;
    const { serialNumber } = params;

    const certificate = await prisma.certificate.findUnique({
      where: { serialNumber },
      include: {
        user: true,
        course: true,
        challenge: true,
      }
    });

    if (!certificate) {
      return new NextResponse("Certificate not found", { status: 404 });
    }

    const courseName = certificate.course?.title || certificate.challenge?.title || "Achievement";
    
    const stream = await generateCertificatePDF({
      recipientName: certificate.user.name,
      courseName: courseName,
      issuedAt: certificate.issuedAt,
      serialNumber: certificate.serialNumber,
      type: certificate.type,
    });

    // @ts-ignore - Response accepts stream
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="certificate-${serialNumber}.pdf"`,
      },
    });

  } catch (error) {
    console.error("Download error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
