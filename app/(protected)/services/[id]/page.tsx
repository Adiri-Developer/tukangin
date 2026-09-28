import { db } from '@/lib/db'
import { Card, CardContent } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function CategoryProvidersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const category = await db.serviceCategory.findUnique({
    where: { id },
    include: {
      providers: {
        include: {
          providerProfile: {
            include: { user: true }
          }
        }
      }
    }
  })

  if (!category) return notFound()

  // For MVP, we will just list all verified providers. Since our seed didn't link providers to categories,
  // we'll fetch all verified providers and display them as a simulation if no providers are linked yet.
  let displayProviders = category.providers.filter(p => p.providerProfile.isVerified)
  
  // MVP Fallback: If no providers linked to this specific category, fetch all verified providers
  if (displayProviders.length === 0) {
    const fallbackProviders = await db.providerProfile.findMany({
      where: { isVerified: true },
      include: { user: true }
    })
    
    displayProviders = fallbackProviders.map(p => ({
      id: 'mock-service-id',
      providerProfileId: p.id,
      serviceCategoryId: id,
      price: 150000,
      providerProfile: p
    })) as any[]
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/services" className={buttonVariants({ variant: 'outline', className: 'border-[#E2E8F0] text-[#0F172A] rounded-lg' })}>
            Kembali
          </Link>
          <h1 className="text-[28px] font-bold text-[#0F172A]">{category.icon} {category.name}</h1>
        </div>

        {displayProviders.length === 0 ? (
          <div className="p-8 text-center bg-white border border-[#E2E8F0] rounded-[16px]">
            <p className="text-[#64748B]">Belum ada Mitra Tukang yang tersedia untuk layanan ini.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayProviders.map((svc) => (
              <Card key={svc.providerProfile.id} className="border-[#E2E8F0] rounded-[16px] bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                    <div className="w-16 h-16 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full flex items-center justify-center flex-shrink-0 relative">
                      <span className="text-2xl text-[#64748B] font-bold">
                        {svc.providerProfile.user.name?.charAt(0) || 'T'}
                      </span>
                      <div className="absolute -bottom-1 -right-1 bg-[#10B981] w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white text-xs">
                        ✓
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-[20px] font-bold text-[#0F172A]">
                          {svc.providerProfile.businessName || svc.providerProfile.user.name}
                        </h3>
                        <span className="bg-[#ECFDF5] text-[#047857] border border-[#6EE7B7] text-[11px] font-bold px-2 py-0.5 rounded-full">
                          Terverifikasi
                        </span>
                      </div>
                      <p className="text-[14px] text-[#334155] mb-2">{svc.providerProfile.description || 'Melayani perbaikan profesional.'}</p>
                      <div className="flex items-center gap-4 text-[12px] text-[#64748B]">
                        <span className="flex items-center gap-1">⭐ 5.0 (0 ulasan)</span>
                        <span>•</span>
                        <span>Pengalaman {svc.providerProfile.experience || 1} Tahun</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
                      <div className="text-left md:text-right">
                        <p className="text-[12px] text-[#64748B]">Mulai dari</p>
                        <p className="text-[20px] font-bold text-[#0F172A] font-[tabular-nums]">Rp150.000</p>
                      </div>
                      <Link href={`/services/${id}/book?providerId=${svc.providerProfile.user.id}`} className={buttonVariants({ className: 'w-full md:w-auto bg-[#FF6B00] hover:bg-[#E05E00] text-white font-semibold rounded-[8px] h-12 px-6' })}>
                        Pesan Tukang
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
