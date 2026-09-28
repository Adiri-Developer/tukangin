import { auth } from '@/auth'
import { db } from '@/lib/db'
import {
  deletePortfolioProject,
  deleteProviderService,
  savePortfolioProject,
  saveProviderService,
} from '@/app/actions/provider-management'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SubmitButton } from './submit-button'
import { BriefcaseBusiness, CheckCircle2, ImageIcon, TriangleAlert, Wrench } from 'lucide-react'

type ManagementPageProps = {
  searchParams: Promise<{
    status?: string
    message?: string
  }>
}

const fieldClass = 'h-12 rounded-[8px] border-[#CBD5E1] bg-white focus-visible:border-[#FF6B00] focus-visible:ring-[#FF6B00]/20'

function formatRupiah(value: number | null) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value ?? 0)
}

export default async function ProviderServicesPage({ searchParams }: ManagementPageProps) {
  const session = await auth()

  if (!session?.user?.email) redirect('/login')

  const [user, categories, feedback] = await Promise.all([
    db.user.findUnique({
      where: { email: session.user.email },
      select: {
        role: true,
        providerProfile: {
          select: {
            id: true,
            services: {
              orderBy: { serviceCategory: { name: 'asc' } },
              include: { serviceCategory: true },
            },
            portfolioProjects: { orderBy: { createdAt: 'desc' } },
          },
        },
      },
    }),
    db.serviceCategory.findMany({ orderBy: { name: 'asc' } }),
    searchParams,
  ])

  if (user?.role !== 'PROVIDER') redirect('/dashboard')

  if (!user.providerProfile) {
    return (
      <div className="mx-auto max-w-3xl rounded-[16px] border border-[#FCA5A5] bg-[#FEF2F2] p-6 text-[#B91C1C]">
        Profil mitra tidak ditemukan. Buat ulang akun provider atau hubungi pengelola platform.
      </div>
    )
  }

  const services = user.providerProfile.services
  const projects = user.providerProfile.portfolioProjects
  const configuredCategoryIds = new Set(services.map((service) => service.serviceCategoryId))
  const availableCategories = categories.filter((category) => !configuredCategoryIds.has(category.id))
  const hasFeedback = feedback.status === 'success' || feedback.status === 'error'

  return (
    <div className="mx-auto max-w-[1200px] space-y-8 pb-12">
      <header className="relative overflow-hidden rounded-[16px] border border-[#1E293B] bg-[#0F172A] px-6 py-7 text-white shadow-[0_4px_6px_-1px_rgba(15,23,42,0.08)] md:px-8 md:py-9">
        <div className="relative z-10 max-w-3xl">
          <p className="mb-2 text-sm font-semibold text-[#FFB693]">Etalase jasa mitra</p>
          <h1 className="text-[28px] font-extrabold leading-tight tracking-[-0.02em] md:text-[36px]">
            Atur jasa dan bukti pekerjaan Anda
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-6 text-slate-300 md:text-base">
            Tentukan kategori beserta harga awal, lalu tunjukkan hasil kerja yang membantu pelanggan memilih dengan yakin.
          </p>
        </div>
        <div aria-hidden="true" className="absolute -bottom-12 right-8 h-32 w-32 rotate-12 rounded-[24px] border border-[#FF6B00]/40 bg-[#FF6B00]/10" />
      </header>

      {hasFeedback && (
        <div
          role="status"
          className={`flex items-start gap-3 rounded-[12px] border p-4 text-sm font-semibold ${
            feedback.status === 'success'
              ? 'border-[#6EE7B7] bg-[#ECFDF5] text-[#047857]'
              : 'border-[#FCA5A5] bg-[#FEF2F2] text-[#B91C1C]'
          }`}
        >
          {feedback.status === 'success' ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          ) : (
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
        <section className="space-y-5" aria-labelledby="services-heading">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 id="services-heading" className="text-[24px] font-extrabold tracking-[-0.02em] text-[#0F172A]">
                Layanan dan harga
              </h2>
              <p className="mt-1 text-sm leading-6 text-[#64748B]">Harga yang disimpan menjadi harga awal yang dilihat pelanggan.</p>
            </div>
            <div className="shrink-0 rounded-[8px] border border-[#E2E8F0] bg-white px-3 py-2 text-sm font-bold tabular-nums text-[#0F172A]">
              {services.length} aktif
            </div>
          </div>

          <Card className="gap-0 rounded-[16px] border border-[#E2E8F0] bg-white py-0 shadow-[0_1px_3px_0_rgba(15,23,42,0.05)]">
            <CardHeader className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-5 py-5 md:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-[#FFF7ED] text-[#C2410C]">
                  <Wrench className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <CardTitle className="font-bold text-[#0F172A]">Tambahkan kategori jasa</CardTitle>
                  <CardDescription className="text-[#64748B]">Satu kategori dapat memiliki satu harga awal.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-5 py-6 md:px-6">
              {categories.length === 0 ? (
                <div className="rounded-[12px] border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-5 text-sm leading-6 text-[#64748B]">
                  Belum ada kategori layanan di database. Pengelola platform perlu membuat kategori sebelum mitra dapat memasang jasa.
                </div>
              ) : availableCategories.length === 0 ? (
                <div className="rounded-[12px] border border-[#6EE7B7] bg-[#ECFDF5] p-5 text-sm font-semibold text-[#047857]">
                  Semua kategori yang tersedia sudah masuk ke daftar layanan Anda.
                </div>
              ) : (
                <form action={saveProviderService} className="grid gap-5 md:grid-cols-[minmax(0,1fr)_220px]">
                  <div className="space-y-2">
                    <Label htmlFor="new-category" className="font-semibold text-[#0F172A]">Kategori layanan</Label>
                    <select id="new-category" name="categoryId" required className={`${fieldClass} w-full px-3 text-sm outline-none`} defaultValue="">
                      <option value="" disabled>Pilih kategori</option>
                      {availableCategories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-price" className="font-semibold text-[#0F172A]">Harga mulai</Label>
                    <Input id="new-price" name="price" type="number" inputMode="numeric" min="10000" max="1000000000" step="1000" required placeholder="150000" className={`${fieldClass} tabular-nums`} />
                  </div>
                  <div className="md:col-span-2">
                    <SubmitButton label="Simpan layanan" pendingLabel="Menyimpan layanan..." className="h-12 w-full rounded-[8px] bg-[#FF6B00] px-5 font-bold text-white hover:bg-[#E05E00] focus-visible:ring-[#FF6B00]/40 md:w-auto" />
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          <div className="space-y-3">
            {services.length === 0 ? (
              <div className="rounded-[16px] border border-dashed border-[#CBD5E1] bg-white p-8 text-center">
                <Wrench className="mx-auto h-7 w-7 text-[#64748B]" aria-hidden="true" />
                <h3 className="mt-3 font-bold text-[#0F172A]">Belum ada layanan aktif</h3>
                <p className="mt-1 text-sm text-[#64748B]">Pilih kategori dan tentukan harga awal untuk mulai tampil di pencarian pelanggan.</p>
              </div>
            ) : (
              services.map((service) => (
                <article key={service.id} className="rounded-[16px] border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.05)] md:p-6">
                  <div className="flex flex-col gap-5 md:flex-row md:items-end">
                    <form action={saveProviderService} className="grid min-w-0 flex-1 gap-4 sm:grid-cols-[minmax(0,1fr)_200px] sm:items-end">
                      <input type="hidden" name="categoryId" value={service.serviceCategoryId} />
                      <div>
                        <p className="text-xs font-semibold text-[#64748B]">Kategori</p>
                        <h3 className="mt-1 text-lg font-bold text-[#0F172A]">{service.serviceCategory.name}</h3>
                        <p className="mt-1 text-sm text-[#64748B]">{service.serviceCategory.description || 'Layanan aktif dan dapat ditemukan pelanggan.'}</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`price-${service.id}`} className="font-semibold text-[#0F172A]">Harga mulai</Label>
                        <Input id={`price-${service.id}`} name="price" type="number" inputMode="numeric" min="10000" max="1000000000" step="1000" required defaultValue={service.price ?? ''} className={`${fieldClass} tabular-nums`} aria-describedby={`current-price-${service.id}`} />
                        <p id={`current-price-${service.id}`} className="text-xs text-[#64748B]">Saat ini {formatRupiah(service.price)}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <SubmitButton label="Perbarui harga" pendingLabel="Memperbarui..." variant="outline" className="h-11 w-full rounded-[8px] border-[#CBD5E1] bg-white px-4 font-semibold text-[#0F172A] hover:bg-[#F1F5F9] sm:w-auto" />
                      </div>
                    </form>
                    <form action={deleteProviderService} className="md:border-l md:border-[#E2E8F0] md:pl-5">
                      <input type="hidden" name="serviceId" value={service.id} />
                      <SubmitButton label="Hapus layanan" pendingLabel="Menghapus..." variant="destructive" className="h-11 w-full rounded-[8px] border border-[#FCA5A5] bg-[#FEF2F2] px-4 font-semibold text-[#B91C1C] hover:bg-red-100 md:w-auto" />
                    </form>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="space-y-5" aria-labelledby="portfolio-heading">
          <div>
            <h2 id="portfolio-heading" className="text-[24px] font-extrabold tracking-[-0.02em] text-[#0F172A]">Portfolio pekerjaan</h2>
            <p className="mt-1 text-sm leading-6 text-[#64748B]">Gunakan proyek nyata dan URL foto yang memang Anda miliki.</p>
          </div>

          <Card className="gap-0 rounded-[16px] border border-[#E2E8F0] bg-white py-0 shadow-[0_4px_6px_-1px_rgba(15,23,42,0.08)]">
            <CardHeader className="border-b border-[#E2E8F0] px-5 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-[#EFF6FF] text-[#1D4ED8]">
                  <BriefcaseBusiness className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <CardTitle className="font-bold text-[#0F172A]">Catat hasil kerja</CardTitle>
                  <CardDescription className="text-[#64748B]">Judul dan deskripsi wajib sesuai proyek nyata.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-5 py-6">
              <form action={savePortfolioProject} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="portfolio-title" className="font-semibold text-[#0F172A]">Judul proyek</Label>
                  <Input id="portfolio-title" name="title" minLength={3} maxLength={100} required placeholder="Renovasi dapur rumah keluarga" className={fieldClass} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="portfolio-description" className="font-semibold text-[#0F172A]">Deskripsi pekerjaan</Label>
                  <textarea id="portfolio-description" name="description" maxLength={600} rows={4} placeholder="Jelaskan ruang lingkup dan hasil pekerjaan." className="w-full resize-y rounded-[8px] border border-[#CBD5E1] bg-white px-3 py-3 text-sm outline-none transition-colors focus:border-[#FF6B00] focus:ring-3 focus:ring-[#FF6B00]/20" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="portfolio-image" className="font-semibold text-[#0F172A]">URL foto (opsional)</Label>
                  <Input id="portfolio-image" name="imageUrl" type="url" placeholder="https://contoh.com/foto-proyek.jpg" className={fieldClass} />
                  <p className="text-xs leading-5 text-[#64748B]">Untuk saat ini gunakan tautan gambar publik. Upload file akan ditambahkan bersama integrasi penyimpanan.</p>
                </div>
                <SubmitButton label="Tambahkan portfolio" pendingLabel="Menambahkan..." className="h-12 w-full rounded-[8px] bg-[#0F172A] px-5 font-bold text-white hover:bg-[#1E293B] focus-visible:ring-[#0F172A]/30" />
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {projects.length === 0 ? (
              <div className="rounded-[16px] border border-dashed border-[#CBD5E1] bg-white p-8 text-center">
                <ImageIcon className="mx-auto h-7 w-7 text-[#64748B]" aria-hidden="true" />
                <h3 className="mt-3 font-bold text-[#0F172A]">Portfolio masih kosong</h3>
                <p className="mt-1 text-sm text-[#64748B]">Tambahkan satu proyek nyata untuk memperkuat profil usaha Anda.</p>
              </div>
            ) : (
              projects.map((project) => {
                const hasImage = Boolean(project.imageUrl && /^https?:\/\//i.test(project.imageUrl))

                return (
                  <article key={project.id} className="overflow-hidden rounded-[16px] border border-[#E2E8F0] bg-white shadow-[0_1px_3px_0_rgba(15,23,42,0.05)]">
                    <div
                      className={`flex h-40 items-end bg-[#DCE9FF] bg-cover bg-center p-4 ${hasImage ? '' : 'justify-center'}`}
                      style={hasImage ? { backgroundImage: `url(${JSON.stringify(project.imageUrl)})` } : undefined}
                      role={hasImage ? 'img' : undefined}
                      aria-label={hasImage ? `Foto proyek ${project.title}` : undefined}
                    >
                      {!hasImage && <ImageIcon className="h-9 w-9 text-[#565E74]" aria-hidden="true" />}
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-[#0F172A]">{project.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-[#64748B]">{project.description || 'Tidak ada deskripsi tambahan.'}</p>

                      <details className="mt-5 border-t border-[#E2E8F0] pt-4">
                        <summary className="cursor-pointer font-semibold text-[#0F172A] outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2">Ubah detail portfolio</summary>
                        <form action={savePortfolioProject} className="mt-4 space-y-4">
                          <input type="hidden" name="portfolioId" value={project.id} />
                          <div className="space-y-2">
                            <Label htmlFor={`title-${project.id}`} className="font-semibold text-[#0F172A]">Judul</Label>
                            <Input id={`title-${project.id}`} name="title" minLength={3} maxLength={100} required defaultValue={project.title} className={fieldClass} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`description-${project.id}`} className="font-semibold text-[#0F172A]">Deskripsi</Label>
                            <textarea id={`description-${project.id}`} name="description" maxLength={600} rows={4} defaultValue={project.description ?? ''} className="w-full resize-y rounded-[8px] border border-[#CBD5E1] bg-white px-3 py-3 text-sm outline-none transition-colors focus:border-[#FF6B00] focus:ring-3 focus:ring-[#FF6B00]/20" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`image-${project.id}`} className="font-semibold text-[#0F172A]">URL foto</Label>
                            <Input id={`image-${project.id}`} name="imageUrl" type="url" defaultValue={project.imageUrl ?? ''} className={fieldClass} />
                          </div>
                          <SubmitButton label="Simpan perubahan" pendingLabel="Menyimpan..." className="h-11 w-full rounded-[8px] bg-[#FF6B00] px-4 font-bold text-white hover:bg-[#E05E00]" />
                        </form>
                      </details>

                      <form action={deletePortfolioProject} className="mt-3">
                        <input type="hidden" name="portfolioId" value={project.id} />
                        <SubmitButton label="Hapus portfolio" pendingLabel="Menghapus..." variant="destructive" className="h-11 w-full rounded-[8px] border border-[#FCA5A5] bg-[#FEF2F2] px-4 font-semibold text-[#B91C1C] hover:bg-red-100" />
                      </form>
                    </div>
                  </article>
                )
              })
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
