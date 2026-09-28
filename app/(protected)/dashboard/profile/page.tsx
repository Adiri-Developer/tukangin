import { auth } from '@/auth'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateProfile, requestVerification } from '@/app/actions/profile'
import { CheckCircle, ShieldAlert, FileText, UserCircle } from 'lucide-react'

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.email) return null

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: { providerProfile: true, customerProfile: true }
  })

  if (!user) {
    return (
      <div className="p-8 text-center bg-[#FEF2F2] border border-[#FCA5A5] rounded-[16px]">
        <p className="text-[#B91C1C] font-semibold mb-2">Sesi Tidak Valid / Akun Tidak Ditemukan</p>
        <p className="text-[#B91C1C]/80">Database baru saja di-reset. Akun lama Anda mungkin telah terhapus. Silakan klik tombol <b>Keluar Akun</b> di bagian bawah layar dan buat akun baru.</p>
      </div>
    )
  }

  const isProvider = user.role === 'PROVIDER'
  const profile = isProvider ? user.providerProfile : user.customerProfile

  return (
    <div className="max-w-2xl space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-[28px] md:text-[36px] font-extrabold text-[#0F172A] tracking-tight mb-1">Profil Saya</h1>
        <p className="text-[#334155] text-lg">Kelola informasi data diri dan kontak Anda.</p>
      </div>

      <Card className="border-[#E2E8F0] rounded-[16px] shadow-[0_1px_3px_0_rgba(15,23,42,0.05)] bg-white overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <UserCircle className="w-6 h-6 text-[#0F172A]" />
            <div>
              <CardTitle className="text-lg font-bold text-[#0F172A]">Informasi Dasar</CardTitle>
              <CardDescription className="text-[#64748B]">Nama dan email terdaftar</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          <div className="space-y-2">
            <Label className="text-[#0F172A] font-semibold text-sm">Nama</Label>
            <Input disabled value={user.name || ''} className="bg-slate-50 text-slate-500 border-[#E2E8F0] h-12 rounded-[8px]" />
          </div>
          <div className="space-y-2">
            <Label className="text-[#0F172A] font-semibold text-sm">Email</Label>
            <Input disabled value={user.email || ''} className="bg-slate-50 text-slate-500 border-[#E2E8F0] h-12 rounded-[8px]" />
          </div>
        </CardContent>
      </Card>

      <form action={updateProfile}>
        <Card className="border-[#E2E8F0] rounded-[16px] shadow-[0_1px_3px_0_rgba(15,23,42,0.05)] bg-white overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-[#E2E8F0]">
            <CardTitle className="text-lg font-bold text-[#0F172A]">Data Profil</CardTitle>
            <CardDescription className="text-[#64748B]">Lengkapi data untuk memudahkan komunikasi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[#0F172A] font-semibold text-sm">Nomor Telepon</Label>
              <Input id="phone" name="phone" defaultValue={profile?.phone || ''} placeholder="08123456789" className="border-[#E2E8F0] h-12 rounded-[8px] focus-visible:ring-[#FF6B00] focus-visible:border-[#FF6B00]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address" className="text-[#0F172A] font-semibold text-sm">Alamat Lengkap</Label>
              <Input id="address" name="address" defaultValue={profile?.address || ''} placeholder="Jl. Contoh No 123" className="border-[#E2E8F0] h-12 rounded-[8px] focus-visible:ring-[#FF6B00] focus-visible:border-[#FF6B00]" />
            </div>

            {isProvider && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="businessName" className="text-[#0F172A] font-semibold text-sm">Nama Usaha / Jasa</Label>
                  <Input id="businessName" name="businessName" defaultValue={user.providerProfile?.businessName || ''} placeholder="Budi AC Servis" className="border-[#E2E8F0] h-12 rounded-[8px] focus-visible:ring-[#FF6B00] focus-visible:border-[#FF6B00]" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-[#0F172A] font-semibold text-sm">Deskripsi Singkat</Label>
                  <Input id="description" name="description" defaultValue={user.providerProfile?.description || ''} placeholder="Melayani servis dan cuci AC" className="border-[#E2E8F0] h-12 rounded-[8px] focus-visible:ring-[#FF6B00] focus-visible:border-[#FF6B00]" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-[#0F172A] font-semibold text-sm">Pengalaman (Tahun)</Label>
                  <Input id="experience" name="experience" type="number" defaultValue={user.providerProfile?.experience || ''} placeholder="5" className="border-[#E2E8F0] h-12 rounded-[8px] focus-visible:ring-[#FF6B00] focus-visible:border-[#FF6B00]" />
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="bg-slate-50 border-t border-[#E2E8F0] pt-6 pb-6">
            <Button type="submit" className="w-full bg-[#FF6B00] hover:bg-[#E05E00] text-white font-semibold rounded-[8px] h-12 shadow-[0_4px_12px_rgba(255,107,0,0.35)] transition-transform active:scale-95">Simpan Perubahan</Button>
          </CardFooter>
        </Card>
      </form>

      {isProvider && (
        <form action={requestVerification}>
          <Card className={`border-[#E2E8F0] rounded-[16px] shadow-[0_1px_3px_0_rgba(15,23,42,0.05)] bg-white overflow-hidden transition-all ${user.providerProfile?.isVerified ? 'border-[#6EE7B7]' : ''}`}>
            <CardHeader className={`border-b ${user.providerProfile?.isVerified ? 'bg-[#ECFDF5] border-[#6EE7B7]' : 'bg-slate-50 border-[#E2E8F0]'}`}>
              <div className="flex items-center gap-3">
                {user.providerProfile?.isVerified ? (
                  <CheckCircle className="w-6 h-6 text-[#10B981]" />
                ) : (
                  <ShieldAlert className="w-6 h-6 text-[#0F172A]" />
                )}
                <div>
                  <CardTitle className="text-lg font-bold text-[#0F172A]">Verifikasi Akun & Kemitraan</CardTitle>
                  <CardDescription className={user.providerProfile?.isVerified ? 'text-[#047857]' : 'text-[#64748B]'}>
                    {user.providerProfile?.isVerified 
                      ? 'Akun Anda sudah diverifikasi dan surat perjanjian kemitraan telah disetujui.' 
                      : 'Selesaikan proses verifikasi dan unggah Surat Perjanjian Kemitraan bermaterai elektronik.'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            {!user.providerProfile?.isVerified && (
              <>
                <CardContent className="space-y-6 pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="ktpNumber" className="text-[#0F172A] font-semibold text-sm">Nomor KTP (NIK)</Label>
                    <Input id="ktpNumber" name="ktpNumber" required placeholder="3201..." className="border-[#E2E8F0] h-12 rounded-[8px] focus-visible:ring-[#FF6B00] focus-visible:border-[#FF6B00]" />
                  </div>
                  
                  <div className="p-4 bg-[#FFF7ED] border border-[#FDBA74] rounded-[12px] space-y-4">
                    <div className="flex gap-3">
                      <FileText className="w-5 h-5 text-[#C2410C] shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-[#C2410C] mb-1">Surat Perjanjian Kemitraan (e-Materai)</h4>
                        <p className="text-xs text-[#9A3412] leading-relaxed">Unduh template perjanjian, bubuhkan e-materai, lalu unggah kembali dokumen tersebut (format PDF/Gambar).</p>
                      </div>
                    </div>
                    <div className="space-y-2 bg-white p-3 rounded-lg border border-[#FDBA74]/50">
                      <Label htmlFor="agreementDoc" className="text-[#9A3412] font-semibold text-xs uppercase tracking-wider">Unggah Dokumen Perjanjian</Label>
                      <Input id="agreementDoc" name="agreementDoc" type="file" accept=".pdf,image/*" required className="border-[#FDBA74] bg-white cursor-pointer h-10 rounded-[6px]" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-slate-50 border-t border-[#E2E8F0] pt-6 pb-6">
                  <Button type="submit" className="w-full bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold rounded-[8px] h-12 transition-transform active:scale-95">Ajukan Verifikasi & Kemitraan</Button>
                </CardFooter>
              </>
            )}
          </Card>
        </form>
      )}
    </div>
  )
}
