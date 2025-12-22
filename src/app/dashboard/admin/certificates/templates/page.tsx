import { Suspense } from "react"
import { getCertificateTemplates, deleteCertificateTemplate } from "@/app/actions/admin-certificate-template-actions"
import { CertificateTemplateDialog } from "@/components/admin/certificate-template-dialog"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

async function TemplateList() {
    const res = await getCertificateTemplates()
    if (!res.success || !res.data) return <div>Gagal memuat template.</div>

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {res.data.map((template: any) => (
                <Card key={template.id} className="overflow-hidden group">
                    <div className="relative aspect-video bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                            src={template.imageUrl} 
                            alt={template.name} 
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <form action={async () => {
                                'use server'
                                await deleteCertificateTemplate(template.id)
                            }}>
                                <Button variant="destructive" size="sm">
                                    <Trash2 className="mr-2 h-4 w-4" /> Hapus
                                </Button>
                            </form>
                        </div>
                    </div>
                    <CardHeader className="p-4">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription>
                            Digunakan di {template._count.courses} kursus
                        </CardDescription>
                    </CardHeader>
                </Card>
            ))}
        </div>
    )
}

export default function CertificateTemplatesPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
            <h2 className="text-3xl font-bold tracking-tight">Template Sertifikat</h2>
            <p className="text-muted-foreground">Upload dan kelola desain background sertifikat.</p>
        </div>
        <CertificateTemplateDialog />
      </div>
      
      <Suspense fallback={<div>Loading templates...</div>}>
        <TemplateList />
      </Suspense>
    </div>
  )
}
