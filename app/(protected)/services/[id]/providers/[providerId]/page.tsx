import { db } from '@/lib/db'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  ImageIcon,
  Star,
  Wrench,
} from 'lucide-react'

function formatRupiah(value: number | null) {
  if (value === null) return 'Belum ditentukan'

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

export default async function ProviderProfilePage({
  params,
}: {
  params: Promise<{ id: string; providerId: string }>
}) {
  const { id: categoryId, providerId } = await params

  const [category, provider] = await Promise.all([
    db.serviceCategory.findUnique({
      where: { id: categoryId },
      select: { id: true, name: true, icon: true },
    }),
    db.providerProfile.findFirst({
      where: {
        id: providerId,
        isVerified: true,
      },
      include: {
        user: { select: { id: true, name: true } },
        services: {
          orderBy: { serviceCategory: { name: 'asc' } },
          include: { serviceCategory: true },
        },
        portfolioProjects: { orderBy: { createdAt: 'desc' } },
        reviews: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            customer: { select: { name: true } },
          },
        },
      },
    }),
  ])

  if (!category || !provider) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="max-w-md rounded-[16px] border border-[#E2E8F0] bg-white p-8 text-center shadow-sm">
          <Wrench className="mx-auto h-9 w-9 text-[#64748B]" aria-hidden="true" />
          <h1 className="mt-4 text-2xl font-extrabold text-[#0F172A]">Profil mitra tidak ditemukan</h1>
          <p className="mt-2 text-sm leading-6 text-[#64748B]">Mitra mungkin sudah tidak aktif atau profilnya telah dihapus.</p>
          <Link href={`/services/${categoryId}`} className={buttonVariants({ className: 'mt-6 h-11 rounded-[8px] bg-[#0F172A] px-5 font-bold text-white hover:bg-[#1E293B]' })}>
            Kembali ke daftar tukang
          </Link>
        </div>
      </div>
    )
  }

  const selectedService = provider.services.find((service) => service.serviceCategoryId === categoryId)
  const reviewCount = provider.reviews.length
  const averageRating = reviewCount > 0
    ? provider.reviews.reduce((total, review) => total + review.rating, 0) / reviewCount
    : null
  const providerName = provider.businessName || provider.user.name || 'Mitra Tukang'

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 pb-12">
      <Link
        href={`/services/${category.id}`}
        className="inline-flex items-center gap-2 rounded-[8px] text-sm font-semibold text-[#334155] outline-none transition-colors hover:text-[#C2410C] focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-4"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Kembali ke tukang {category.name}
      </Link>

      <header className="overflow-hidden rounded-[16px] border border-[#1E293B] bg-[#0F172A] text-white shadow-[0_4px_12px_rgba(15,23,42,0.12)]">
        <div className="grid gap-8 p-6 md:grid-cols-[minmax(0,1fr)_280px] md:p-9">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-white/20 bg-white/10 text-3xl font-extrabold text-white">
              {provider.user.name?.charAt(0) || 'T'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-[30px] font-extrabold leading-tight tracking-[-0.02em] md:text-[38px]">{providerName}</h1>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#6EE7B7]/50 bg-[#064E3B] px-3 py-1 text-xs font-bold text-[#A7F3D0]">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Terverifikasi
                </span>
              </div>
              <p className="mt-3 max-w-2xl leading-7 text-slate-300">{provider.description || 'Mitra belum menambahkan deskripsi usaha.'}</p>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-slate-200">
                <span className="flex items-center gap-1.5">
                  <Star className={`h-4 w-4 ${averageRating ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} aria-hidden="true" />
                  {averageRating ? `${averageRating.toFixed(1)} dari ${reviewCount} ulasan` : 'Belum ada ulasan'}
                </span>
                <span>{provider.experience || 0} tahun pengalaman</span>
                <span>{provider.portfolioProjects.length} portfolio</span>
              </div>
            </div>
          </div>

          <div className="self-stretch rounded-[12px] border border-white/15 bg-white/5 p-5">
            <p className="text-xs font-semibold text-slate-300">{category.icon} {category.name}</p>
            <p className="mt-2 text-sm text-slate-300">Harga mulai</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums text-white">{formatRupiah(selectedService?.price ?? null)}</p>
            <Link
              href={`/services/${category.id}/book?providerId=${provider.user.id}`}
              className={buttonVariants({ className: 'mt-5 h-12 w-full rounded-[8px] bg-[#FF6B00] px-5 font-bold text-white shadow-[0_4px_12px_rgba(255,107,0,0.25)] hover:bg-[#E05E00]' })}
            >
              Pesan {category.name}
            </Link>
          </div>
        </div>
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section aria-labelledby="portfolio-heading">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-[#C2410C]">Bukti pekerjaan</p>
              <h2 id="portfolio-heading" className="mt-1 text-[26px] font-extrabold tracking-[-0.02em] text-[#0F172A]">Portfolio {providerName}</h2>
            </div>
            <span className="text-sm font-semibold tabular-nums text-[#64748B]">{provider.portfolioProjects.length} proyek</span>
          </div>

          {provider.portfolioProjects.length === 0 ? (
            <div className="rounded-[16px] border border-dashed border-[#CBD5E1] bg-white p-10 text-center">
              <ImageIcon className="mx-auto h-8 w-8 text-[#64748B]" aria-hidden="true" />
              <h3 className="mt-3 font-bold text-[#0F172A]">Portfolio belum ditambahkan</h3>
              <p className="mt-1 text-sm text-[#64748B]">Mitra ini belum mempublikasikan hasil pekerjaannya.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {provider.portfolioProjects.map((project) => {
                const hasImage = Boolean(project.imageUrl && /^https?:\/\//i.test(project.imageUrl))

                return (
                  <article key={project.id} className="overflow-hidden rounded-[16px] border border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
                    <div
                      className={`flex h-52 bg-[#DCE9FF] bg-cover bg-center ${hasImage ? '' : 'items-center justify-center'}`}
                      style={hasImage ? { backgroundImage: `url(${JSON.stringify(project.imageUrl)})` } : undefined}
                      role={hasImage ? 'img' : undefined}
                      aria-label={hasImage ? `Foto proyek ${project.title}` : undefined}
                    >
                      {!hasImage && <ImageIcon className="h-10 w-10 text-[#565E74]" aria-hidden="true" />}
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-[#0F172A]">{project.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-[#64748B]">{project.description || 'Tidak ada deskripsi tambahan.'}</p>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <section className="rounded-[16px] border border-[#E2E8F0] bg-white p-5" aria-labelledby="services-heading">
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-[#C2410C]" aria-hidden="true" />
              <h2 id="services-heading" className="font-bold text-[#0F172A]">Layanan lain</h2>
            </div>
            {provider.services.length === 0 ? (
              <p className="mt-4 text-sm leading-6 text-[#64748B]">Mitra belum menentukan daftar layanan dan harga.</p>
            ) : (
              <div className="mt-4 divide-y divide-[#E2E8F0]">
                {provider.services.map((service) => (
                  <div key={service.id} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                    <span className="text-sm font-semibold text-[#334155]">{service.serviceCategory.name}</span>
                    <span className="shrink-0 text-sm font-bold tabular-nums text-[#0F172A]">{formatRupiah(service.price)}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-[16px] border border-[#E2E8F0] bg-white p-5" aria-labelledby="reviews-heading">
            <div className="flex items-center gap-2">
              <BriefcaseBusiness className="h-5 w-5 text-[#C2410C]" aria-hidden="true" />
              <h2 id="reviews-heading" className="font-bold text-[#0F172A]">Ulasan customer</h2>
            </div>
            {provider.reviews.length === 0 ? (
              <p className="mt-4 text-sm leading-6 text-[#64748B]">Belum ada ulasan untuk mitra ini.</p>
            ) : (
              <div className="mt-4 space-y-4">
                {provider.reviews.slice(0, 3).map((review) => (
                  <article key={review.id} className="border-t border-[#E2E8F0] pt-4 first:border-0 first:pt-0">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-bold text-[#0F172A]">{review.customer.name || 'Customer'}</span>
                      <span className="flex items-center gap-1 text-xs font-bold text-[#92400E]">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" aria-hidden="true" /> {review.rating}.0
                      </span>
                    </div>
                    {review.comment && <p className="mt-2 text-sm leading-6 text-[#64748B]">“{review.comment}”</p>}
                    <p className="mt-2 text-xs text-[#64748B]">{new Date(review.createdAt).toLocaleDateString('id-ID')}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  )
}
