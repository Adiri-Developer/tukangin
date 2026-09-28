import { auth } from '@/auth'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateProfile, requestVerification } from '@/app/actions/profile'

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.email) return null

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: { providerProfile: true, customerProfile: true }
  })

  if (!user) {
    return (
      <div className="p-8 text-center bg-white border border-[#FCA5A5] rounded-[16px]">
        <p className="text-[#B91C1C] font-semibold mb-2">Sesi Tidak Valid / Akun Tidak Ditemukan</p>
        <p className="text-[#64748B]">Database baru saja di-reset. Akun lama Anda mungkin telah terhapus. Silakan klik tombol <b>Keluar Akun</b> di bagian bawah layar dan buat akun baru.</p>
      </div>
    )
  }

  const isProvider = user.role === 'PROVIDER'
  const profile = isProvider ? user.providerProfile : user.customerProfile

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Profil Saya</h1>
        <p className="text-slate-600">Kelola informasi data diri dan kontak Anda.</p>
      </div>

      <Card className="border-slate-200 rounded-[16px]">
        <CardHeader>
          <CardTitle>Informasi Dasar</CardTitle>
          <CardDescription>Nama dan email terdaftar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Nama</Label>
            <Input disabled value={user.name || ''} className="bg-slate-50 text-slate-500" />
          </div>
          <div>
            <Label>Email</Label>
            <Input disabled value={user.email || ''} className="bg-slate-50 text-slate-500" />
          </div>
        </CardContent>
      </Card>

      <form action={updateProfile}>
        <Card className="border-slate-200 rounded-[16px]">
          <CardHeader>
            <CardTitle>Data Profil</CardTitle>
            <CardDescription>Lengkapi data untuk memudahkan komunikasi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Nomor Telepon</Label>
              <Input id="phone" name="phone" defaultValue={profile?.phone || ''} placeholder="08123456789" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Alamat Lengkap</Label>
              <Input id="address" name="address" defaultValue={profile?.address || ''} placeholder="Jl. Contoh No 123" />
            </div>

            {isProvider && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="businessName">Nama Usaha / Jasa</Label>
                  <Input id="businessName" name="businessName" defaultValue={user.providerProfile?.businessName || ''} placeholder="Budi AC Servis" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi Singkat</Label>
                  <Input id="description" name="description" defaultValue={user.providerProfile?.description || ''} placeholder="Melayani servis dan cuci AC" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Pengalaman (Tahun)</Label>
                  <Input id="experience" name="experience" type="number" defaultValue={user.providerProfile?.experience || ''} placeholder="5" />
                </div>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="bg-[#FF6B00] hover:bg-[#E05E00] text-white">Simpan Perubahan</Button>
          </CardFooter>
        </Card>
      </form>

      {isProvider && (
        <form action={requestVerification}>
          <Card className="border-[#E2E8F0] rounded-[16px]">
            <CardHeader>
              <CardTitle>Verifikasi Akun & Kemitraan</CardTitle>
              <CardDescription>
                {user.providerProfile?.isVerified 
                  ? 'Akun Anda sudah diverifikasi dan surat perjanjian kemitraan telah disetujui.' 
                  : 'Selesaikan proses verifikasi dan unggah Surat Perjanjian Kemitraan bermaterai elektronik.'}
              </CardDescription>
            </CardHeader>
            {!user.providerProfile?.isVerified && (
              <>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="ktpNumber">Nomor KTP (NIK)</Label>
                    <Input id="ktpNumber" name="ktpNumber" required placeholder="3201..." className="border-[#E2E8F0] focus-visible:ring-[#FF6B00]" />
                  </div>
                  
                  <div className="p-4 bg-[#FFF7ED] border border-[#FDBA74] rounded-lg space-y-4">
                    <div>
                      <h4 className="text-[14px] font-bold text-[#C2410C]">Surat Perjanjian Kemitraan (e-Materai)</h4>
                      <p className="text-[12px] text-[#9A3412]">Unduh template perjanjian, bubuhkan e-materai, lalu unggah kembali dokumen tersebut (format PDF/Gambar).</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="agreementDoc" className="text-[#9A3412]">Unggah Dokumen Perjanjian</Label>
                      <Input id="agreementDoc" name="agreementDoc" type="file" accept=".pdf,image/*" required className="border-[#FDBA74] bg-white cursor-pointer" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="bg-[#0F172A] hover:bg-[#1E293B] text-white">Ajukan Verifikasi & Kemitraan</Button>
                </CardFooter>
              </>
            )}
          </Card>
        </form>
      )}
    </div>
  )
}
