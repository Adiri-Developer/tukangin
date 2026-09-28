import { registerUser } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 py-12">
      <Card className="w-full max-w-md border-slate-200 rounded-[16px] shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">Daftar Akun Baru</CardTitle>
          <CardDescription className="text-slate-500">
            Pilih peran Anda dan lengkapi data untuk memulai
          </CardDescription>
        </CardHeader>
        <form action={registerUser}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Budi Santoso"
                required
                className="h-12 border-slate-200 focus-visible:ring-2 focus-visible:ring-[#FF6B00]/20 focus-visible:border-[#FF6B00]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nama@email.com"
                required
                className="h-12 border-slate-200 focus-visible:ring-2 focus-visible:ring-[#FF6B00]/20 focus-visible:border-[#FF6B00]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="h-12 border-slate-200 focus-visible:ring-2 focus-visible:ring-[#FF6B00]/20 focus-visible:border-[#FF6B00]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Saya ingin mendaftar sebagai:</Label>
              <select
                id="role"
                name="role"
                className="flex w-full h-12 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]/20 focus-visible:border-[#FF6B00]"
                required
              >
                <option value="CUSTOMER">Customer (Mencari Tukang)</option>
                <option value="PROVIDER">Mitra Tukang (Menawarkan Jasa)</option>
              </select>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full h-12 bg-[#FF6B00] hover:bg-[#E05E00] text-white font-semibold rounded-lg text-[16px]"
            >
              Daftar Sekarang
            </Button>
            <div className="text-center text-sm text-slate-500">
              Sudah punya akun?{' '}
              <Link href="/login" className="font-semibold text-[#FF6B00] hover:underline">
                Masuk
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
