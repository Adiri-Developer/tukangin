import { db } from '@/lib/db'
import { Card, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, CheckCircle2, Search, Star, ShieldCheck } from 'lucide-react'

export default async function CategoryProvidersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const category = await db.serviceCategory.findUnique({
    where: { id },
    include: {
      providers: {
        include: {
          providerProfile: {
            include: {
              user: true,
              _count: { select: { portfolioProjects: true } },
              reviews: {
                select: { rating: true },
              },
            }
          }
        }
      }
    }
  })

  if (!category) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-md rounded-[16px] border border-[#FCA5A5] bg-white p-8 text-center shadow-sm">
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
      include: {
        user: true,
        _count: { select: { portfolioProjects: true } },
        reviews: {
          select: { rating: true },
        },
      }
    })
    
    displayProviders = fallbackProviders.map(p => ({
      id: 'mock-service-id',
      providerProfileId: p.id,
      serviceCategoryId: id,
      price: null,
      providerProfile: p
    }))
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 animate-in fade-in duration-300">
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
            {displayProviders.map((svc) => {
              const reviewCount = svc.providerProfile.reviews.length
              const averageRating = reviewCount > 0
                ? svc.providerProfile.reviews.reduce((total, review) => total + review.rating, 0) / reviewCount
                : null

              return (
              <Card key={svc.providerProfile.id} className="border-[#E2E8F0] rounded-[16px] bg-white overflow-hidden shadow-[0_1px_3px_0_rgba(15,23,42,0.05)] hover:-translate-y-1 hover:shadow-md hover:border-[#CBD5E1] transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                    <Link
                      href={`/services/${category.id}/providers/${svc.providerProfile.id}`}
                      className="group/profile flex min-w-0 flex-1 flex-col gap-5 rounded-[10px] outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-4 sm:flex-row"
                      aria-label={`Lihat profil dan portfolio ${svc.providerProfile.businessName || svc.providerProfile.user.name || 'mitra tukang'}`}
                    >
                      <div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border-[1.5px] border-[#E2E8F0] bg-[#F8FAFC] transition-colors group-hover/profile:border-[#FDBA74]">
                        <span className="text-2xl font-bold text-[#64748B]">
                          {svc.providerProfile.user.name?.charAt(0) || 'T'}
                        </span>
                        <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#10B981] text-white">
                          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <h3 className="text-[20px] font-bold text-[#0F172A] transition-colors group-hover/profile:text-[#C2410C]">
                            {svc.providerProfile.businessName || svc.providerProfile.user.name}
                          </h3>
                          <span className="flex items-center gap-1 rounded-full border border-[#6EE7B7] bg-[#ECFDF5] px-2.5 py-0.5 text-[11px] font-bold text-[#047857]">
                            <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> Terverifikasi
                          </span>
                        </div>
                        <p className="mb-3 text-[14px] leading-relaxed text-[#334155]">{svc.providerProfile.description || 'Mitra belum menambahkan deskripsi usaha.'}</p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] font-semibold text-[#64748B]">
                          <span className="flex items-center gap-1 text-[#0F172A]">
                            <Star className={`h-4 w-4 ${averageRating ? 'fill-amber-500 text-amber-500' : 'text-[#94A3B8]'}`} aria-hidden="true" />
                            {averageRating ? `${averageRating.toFixed(1)} (${reviewCount} ulasan)` : 'Belum ada ulasan'}
                          </span>
                          <span>Pengalaman {svc.providerProfile.experience || 0} tahun</span>
                          <span>{svc.providerProfile._count.portfolioProjects} portfolio</span>
                        </div>
                        <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#C2410C]">
                          Lihat profil dan portfolio <ArrowRight className="h-4 w-4 transition-transform group-hover/profile:translate-x-1" aria-hidden="true" />
                        </span>
                      </div>
                    </Link>

                    <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-[#E2E8F0]">
                      <div className="text-left md:text-right">
                        <p className="text-[12px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">Mulai dari</p>
                        <p className="text-[24px] font-extrabold text-[#0F172A] tabular-nums">
                          {svc.price === null
                            ? 'Belum ditentukan'
                            : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(svc.price)}
                        </p>
                      </div>
                      <Link href={`/services/${category.id}/book?providerId=${svc.providerProfile.user.id}`} className={buttonVariants({ className: 'w-full md:w-auto bg-[#FF6B00] hover:bg-[#E05E00] text-white font-bold rounded-[8px] h-12 px-8 shadow-[0_4px_12px_rgba(255,107,0,0.35)] transition-transform active:scale-95' })}>
                        Pesan Tukang
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
              )
            })}
          </div>
        )}
    </div>
  )
}
