import { db } from '@/lib/db'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createBooking } from '@/app/actions/booking'
import Link from 'next/link'
import { CalendarClock, MapPin, Wrench, ShieldCheck, UserCircle, Search } from 'lucide-react'

export default async function BookingPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ id: string }>
  searchParams: Promise<{ providerId?: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { id } = await params
  const { providerId } = await searchParams

  if (!providerId) redirect(`/services/${id}`)

  const provider = await db.user.findUnique({
    where: { id: providerId },
    include: { providerProfile: true }
  })

  const category = await db.serviceCategory.findUnique({
    where: { id }
  })

  if (!provider || !category) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-md rounded-[16px] border border-[#FCA5A5] bg-white p-8 text-center shadow-sm">
          <div className="w-12 h-12 bg-red-50 text-[#B91C1C] rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6" />
          </div>
          <h2 className="text-[#B91C1C] font-bold text-xl mb-2">Data Tidak Ditemukan</h2>
          <p className="text-[#64748B] mb-6">Tukang atau Kategori Layanan tidak valid. (Tautan ini mungkin sudah usang akibat reset database).</p>
          <Link href="/services" className={buttonVariants({ className: 'bg-[#0F172A] hover:bg-[#1E293B] text-white w-full h-12 font-bold rounded-[8px]' })}>
            Kembali ke Daftar Layanan
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-[60vh] w-full items-center justify-center animate-in fade-in zoom-in-95 duration-300">
      <Card className="w-full max-w-xl border-[#E2E8F0] rounded-[16px] shadow-[0_4px_6px_-1px_rgba(15,23,42,0.08)] bg-white overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-[#E2E8F0] px-6 py-6 text-center md:text-left">
          <CardTitle className="text-[24px] font-extrabold text-[#0F172A] tracking-tight">Formulir Pemesanan</CardTitle>
          <CardDescription className="text-[#64748B] text-base mt-1">
            Pesan layanan <b>{category.name}</b> dengan <b>{provider.providerProfile?.businessName || provider.name}</b>
          </CardDescription>
        </CardHeader>
        <form action={async (formData) => {
          'use server'
          await createBooking(formData)
        }}>
          <input type="hidden" name="providerId" value={provider.id} />
          <input type="hidden" name="categoryId" value={category.id} />
          
          <CardContent className="space-y-6 pt-6">
            <div className="bg-[#ECFDF5] border border-[#6EE7B7] p-4 rounded-[12px] flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-[#6EE7B7] shrink-0">
                <UserCircle className="w-6 h-6 text-[#047857]" />
              </div>
              <div>
                <p className="text-[12px] text-[#047857] font-bold uppercase tracking-wider mb-0.5">Mitra Tukang Terpilih</p>
                <p className="text-[18px] font-extrabold text-[#065F46]">{provider.providerProfile?.businessName || provider.name}</p>
              </div>
              <ShieldCheck className="w-6 h-6 text-[#10B981] ml-auto hidden md:block" />
            </div>

            <div className="space-y-2 group">
              <Label htmlFor="date" className="text-[14px] font-semibold text-[#0F172A] flex items-center gap-2 group-focus-within:text-[#FF6B00] transition-colors">
                <CalendarClock className="w-4 h-4" /> Tanggal & Waktu Pengerjaan
              </Label>
              <Input id="date" name="date" type="datetime-local" required className="h-12 border-[#E2E8F0] rounded-[8px] focus-visible:ring-[#FF6B00]/20 focus-visible:border-[#FF6B00] transition-colors" />
            </div>
            
            <div className="space-y-2 group">
              <Label htmlFor="address" className="text-[14px] font-semibold text-[#0F172A] flex items-center gap-2 group-focus-within:text-[#FF6B00] transition-colors">
                <MapPin className="w-4 h-4" /> Alamat Lengkap Tujuan
              </Label>
              <Input id="address" name="address" required placeholder="Jl. Sudirman No. 45, Jakarta" className="h-12 border-[#E2E8F0] rounded-[8px] focus-visible:ring-[#FF6B00]/20 focus-visible:border-[#FF6B00] transition-colors" />
            </div>

            <div className="space-y-2 group">
              <Label htmlFor="description" className="text-[14px] font-semibold text-[#0F172A] flex items-center gap-2 group-focus-within:text-[#FF6B00] transition-colors">
                <Wrench className="w-4 h-4" /> Deskripsi Masalah / Pekerjaan
              </Label>
              <textarea 
                id="description" 
                name="description" 
                required 
                placeholder="Contoh: AC tidak dingin dan meneteskan air dari indoor unit..."
                className="flex w-full rounded-[8px] border border-[#E2E8F0] bg-white px-3 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]/20 focus-visible:border-[#FF6B00] min-h-[120px] transition-colors resize-y"
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col md:flex-row gap-3 border-t border-[#E2E8F0] bg-slate-50 pt-6 pb-6 rounded-b-[16px]">
            <Link href={`/services/${id}`} className={buttonVariants({ variant: 'outline', className: 'w-full md:w-1/3 h-12 rounded-[8px] border-[#E2E8F0] font-semibold bg-white hover:bg-slate-50 text-[#0F172A]' })}>
              Batal
            </Link>
            <Button type="submit" className="w-full md:w-2/3 h-12 bg-[#FF6B00] hover:bg-[#E05E00] text-white font-bold rounded-[8px] shadow-[0_4px_12px_rgba(255,107,0,0.35)] transition-transform active:scale-95">
              Konfirmasi & Buat Pesanan
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
