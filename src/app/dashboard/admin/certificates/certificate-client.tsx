'use client'

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog"
import { revokeCertificate } from "@/app/actions/admin-certificate-actions"
import { Loader2, Search, Trash2, Download, ShieldCheck } from "lucide-react"

interface Certificate {
  id: string
  serialNumber: string
  type: string
  issuedAt: Date
  user: {
    name: string
    email: string
  }
  course?: { title: string }
  challenge?: { title: string }
}

interface PaginationProps {
  total: number
  pages: number
  page: number
  limit: number
}

interface CertificateClientProps {
  initialCertificates: Certificate[]
  pagination: PaginationProps
}

export function CertificateClient({ initialCertificates, pagination }: CertificateClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams)
    if (searchQuery) {
      params.set("q", searchQuery)
    } else {
      params.delete("q")
    }
    params.set("page", "1") // Reset to page 1
    router.push(`?${params.toString()}`)
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", newPage.toString())
    router.push(`?${params.toString()}`)
  }

  const handleRevoke = async (id: string) => {
    setLoadingId(id)
    try {
      const res = await revokeCertificate(id)
      if (res.success) {
        toast.success("Certificate revoked successfully")
        // router.refresh() // Action already revalidates, but refresh updates client cache if needed
      } else {
        toast.error(res.error || "Failed to revoke certificate")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-sm">
          <Input 
            placeholder="Search serial, user name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button type="submit" variant="secondary">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Serial Number</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Context</TableHead>
              <TableHead>Issued Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialCertificates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No certificates found.
                </TableCell>
              </TableRow>
            ) : (
              initialCertificates.map((cert) => (
                <TableRow key={cert.id}>
                  <TableCell className="font-mono text-xs">{cert.serialNumber}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{cert.user.name}</span>
                      <span className="text-xs text-muted-foreground">{cert.user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      cert.type === 'COURSE' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {cert.type}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {cert.type === 'COURSE' ? cert.course?.title : cert.challenge?.title}
                  </TableCell>
                  <TableCell>
                    {new Date(cert.issuedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(`/certificates/${cert.serialNumber}`, '_blank')}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Revoke Certificate?</DialogTitle>
                            <DialogDescription>
                              This action cannot be undone. The certificate {cert.serialNumber} will be permanently deleted.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button 
                              variant="destructive" 
                              onClick={() => handleRevoke(cert.id)}
                              disabled={loadingId === cert.id}
                            >
                              {loadingId === cert.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Revoke"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.pages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
