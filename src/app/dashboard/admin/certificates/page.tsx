import { Suspense } from "react"
import { getAllCertificates } from "@/app/actions/admin-certificate-actions"
import { CertificateClient } from "./certificate-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LayoutTemplate } from "lucide-react"

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
  
  const certificates = response.success && response.data ? response.data.map((c: any) => ({
    ...c,
    issuedAt: c.issuedAt, 
  })) : []

  const pagination = response.success && response.pagination ? {
    total: response.pagination.totalCount,
    pages: response.pagination.totalPages,
    page: response.pagination.currentPage,
    limit: 10
  } : { total: 0, pages: 0, page: 1, limit: 10 }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Certificates</h2>
        <Link href="/dashboard/admin/certificates/templates">
            <Button variant="outline">
                <LayoutTemplate className="mr-2 h-4 w-4" /> Kelola Template
            </Button>
        </Link>
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
