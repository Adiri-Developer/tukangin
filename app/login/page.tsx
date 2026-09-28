import { authenticate } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md border-slate-200 rounded-[16px] shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">Masuk ke Tukangin</CardTitle>
          <CardDescription className="text-slate-500">
            Masukkan email dan password untuk melanjutkan
          </CardDescription>
        </CardHeader>
        <form action={authenticate}>
          <CardContent className="space-y-4">
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
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full h-12 bg-[#FF6B00] hover:bg-[#E05E00] text-white font-semibold rounded-lg text-[16px]"
            >
              Masuk
            </Button>
            <div className="text-center text-sm text-slate-500">
              Belum punya akun?{' '}
              <Link href="/register" className="font-semibold text-[#FF6B00] hover:underline">
                Daftar
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
