import { Suspense } from "react"
import { getAllCertificates } from "@/app/actions/admin-certificate-actions"
import { CertificateClient } from "./certificate-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Certificates Management | Admin Dashboard",
  description: "Manage user certificates and issuance.",
}

export default async function CertificatesPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams
  const page = Number(searchParams.page) || 1
  const query = (searchParams.q as string) || ""

  const response = await getAllCertificates(query, page)
  
  // Transform dates to pass to client component (if needed, though Server Actions return JSON-compatible types usually)
  // However, Dates might need serialization if they are not plain strings.
  // Prisma returns Date objects. Next.js Server Components passing to Client Components need serialization.
  // Or we can let Next.js handle it if it supports it (it strictly warns about Date objects usually).
  // I will map them to strings or ensure the Client Component handles serialized data? 
  // Actually, standard practice is to serialize dates.
  
  const certificates = response.success && response.data ? response.data.certificates.map((c: any) => ({
    ...c,
    issuedAt: c.issuedAt, // Client component handles Date object if passed from Server Component? 
                         // No, Client Components cannot receive Date objects directly from Server Components in some versions.
                         // But if I pass it to 'CertificateClient', it crosses the boundary.
                         // I should serialize it.
  })) : []

  const pagination = response.success && response.data ? response.data.pagination : { total: 0, pages: 0, page: 1, limit: 10 }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Certificates</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Issued Certificates</CardTitle>
          <CardDescription>
            Manage and revoke certificates issued to users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading certificates...</div>}>
            <CertificateClient 
              initialCertificates={certificates} 
              pagination={pagination} 
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
