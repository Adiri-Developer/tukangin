import { db } from '@/lib/db'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createBooking } from '@/app/actions/booking'
import Link from 'next/link'

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

  if (!provider || !category) redirect('/services')

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 flex items-center justify-center">
      <Card className="w-full max-w-xl border-[#E2E8F0] rounded-[16px] shadow-sm bg-white">
        <CardHeader className="border-b border-[#E2E8F0] mb-4">
          <CardTitle className="text-2xl font-bold text-[#0F172A]">Formulir Pemesanan</CardTitle>
          <CardDescription>
            Pesan layanan {category.name} dengan {provider.providerProfile?.businessName || provider.name}
          </CardDescription>
        </CardHeader>
        <form action={createBooking}>
          <input type="hidden" name="providerId" value={provider.id} />
          <input type="hidden" name="categoryId" value={category.id} />
          
          <CardContent className="space-y-4">
            <div className="bg-[#EFF6FF] border border-[#93C5FD] p-4 rounded-lg mb-4">
              <p className="text-[14px] text-[#1D4ED8] font-semibold">Tukang yang dipilih:</p>
              <p className="text-[16px] font-bold text-[#0F172A]">{provider.name}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Tanggal & Waktu Pengerjaan</Label>
              <Input id="date" name="date" type="datetime-local" required className="h-12 border-[#E2E8F0]" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Alamat Lengkap Tujuan</Label>
              <Input id="address" name="address" required placeholder="Jl. Sudirman No. 45, Jakarta" className="h-12 border-[#E2E8F0]" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi Masalah / Pekerjaan</Label>
              <textarea 
                id="description" 
                name="description" 
                required 
                placeholder="Contoh: AC tidak dingin dan meneteskan air..."
                className="flex w-full rounded-md border border-[#E2E8F0] bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]/20 focus-visible:border-[#FF6B00] min-h-[100px]"
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex gap-4 border-t border-[#E2E8F0] pt-6">
            <Link href={`/services/${id}`} className="w-full">
              <Button type="button" variant="outline" className="w-full h-12 rounded-[8px] border-[#E2E8F0]">Batal</Button>
            </Link>
            <Button type="submit" className="w-full h-12 bg-[#FF6B00] hover:bg-[#E05E00] text-white font-semibold rounded-[8px]">
              Konfirmasi Pesanan
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
