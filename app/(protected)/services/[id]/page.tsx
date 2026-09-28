import { db } from '@/lib/db'
import { Card, CardContent } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Search, Star, ShieldCheck } from 'lucide-react'

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

  if (!category) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 flex items-center justify-center">
        <div className="text-center p-8 bg-white border border-[#FCA5A5] rounded-[16px] shadow-sm max-w-md">
          <div className="w-12 h-12 bg-red-50 text-[#B91C1C] rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6" />
          </div>
          <h2 className="text-[#B91C1C] font-bold text-xl mb-2">Kategori Tidak Ditemukan</h2>
          <p className="text-[#64748B] mb-6">Layanan ini tidak ditemukan (Mungkin karena database baru saja direset). Silakan kembali ke halaman layanan.</p>
          <Link href="/services" className={buttonVariants({ className: 'bg-[#0F172A] hover:bg-[#1E293B] text-white w-full' })}>
            Kembali ke Daftar Layanan
          </Link>
        </div>
      </div>
    )
  }

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
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 animate-in fade-in duration-300">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/services" className={buttonVariants({ variant: 'outline', className: 'border-[#E2E8F0] text-[#0F172A] rounded-[8px] hover:bg-slate-50 transition-colors h-11 px-4' })}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
          </Link>
          <h1 className="text-[28px] md:text-[36px] font-extrabold text-[#0F172A] tracking-tight flex items-center gap-3">
            <span className="text-3xl">{category.icon}</span> {category.name}
          </h1>
        </div>

        {displayProviders.length === 0 ? (
          <div className="p-12 text-center bg-white border border-[#E2E8F0] rounded-[16px] shadow-[0_1px_3px_0_rgba(15,23,42,0.05)]">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <Search className="w-8 h-8 text-[#94A3B8]" />
            </div>
            <p className="text-[#64748B] text-lg">Belum ada Mitra Tukang yang tersedia untuk layanan ini.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayProviders.map((svc) => (
              <Card key={svc.providerProfile.id} className="border-[#E2E8F0] rounded-[16px] bg-white overflow-hidden shadow-[0_1px_3px_0_rgba(15,23,42,0.05)] hover:-translate-y-1 hover:shadow-md hover:border-[#CBD5E1] transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                    <div className="w-16 h-16 bg-[#F8FAFC] border-[1.5px] border-[#E2E8F0] rounded-full flex items-center justify-center flex-shrink-0 relative">
                      <span className="text-2xl text-[#64748B] font-bold">
                        {svc.providerProfile.user.name?.charAt(0) || 'T'}
                      </span>
                      <div className="absolute -bottom-1 -right-1 bg-[#10B981] w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-[20px] font-bold text-[#0F172A]">
                          {svc.providerProfile.businessName || svc.providerProfile.user.name}
                        </h3>
                        <span className="bg-[#ECFDF5] text-[#047857] border border-[#6EE7B7] text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Terverifikasi
                        </span>
                      </div>
                      <p className="text-[14px] text-[#334155] mb-3 leading-relaxed">{svc.providerProfile.description || 'Melayani perbaikan profesional dengan jaminan kualitas.'}</p>
                      <div className="flex items-center gap-4 text-[12px] text-[#64748B] font-semibold">
                        <span className="flex items-center gap-1 text-[#0F172A]"><Star className="w-4 h-4 text-amber-500 fill-amber-500" /> 5.0 (Baru)</span>
                        <span>•</span>
                        <span>Pengalaman {svc.providerProfile.experience || 1} Tahun</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-[#E2E8F0]">
                      <div className="text-left md:text-right">
                        <p className="text-[12px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">Mulai dari</p>
                        <p className="text-[24px] font-extrabold text-[#0F172A] tabular-nums">Rp150.000</p>
                      </div>
                      <Link href={`/services/${category.id}/book?providerId=${svc.providerProfile.user.id}`} className={buttonVariants({ className: 'w-full md:w-auto bg-[#FF6B00] hover:bg-[#E05E00] text-white font-bold rounded-[8px] h-12 px-8 shadow-[0_4px_12px_rgba(255,107,0,0.35)] transition-transform active:scale-95' })}>
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
