import { authenticate } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { LogIn, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      {/* Decorative Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex justify-center">
        <div className="w-full max-w-[1200px] h-full relative">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#FF6B00]/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl"></div>
        </div>
      </div>

      <Card className="w-full max-w-md border-[#E2E8F0] rounded-[16px] shadow-[0_4px_6px_-1px_rgba(15,23,42,0.08),0_2px_4px_-2px_rgba(15,23,42,0.04)] bg-white z-10 animate-in fade-in zoom-in-95 duration-300">
        <CardHeader className="space-y-2 pb-6 text-center">
          <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-sm">
            <LogIn className="w-6 h-6 text-[#FF6B00]" />
          </div>
          <CardTitle className="text-[28px] font-extrabold tracking-tight text-[#0F172A]">
            Tukang<span className="text-[#FF6B00]">In</span>
          </CardTitle>
          <CardDescription className="text-[#64748B] text-[16px]">
            Masuk untuk melanjutkan
          </CardDescription>
        </CardHeader>
        <form action={async (formData) => {
          'use server'
          await authenticate(formData)
        }}>
          <CardContent className="space-y-5">
            <div className="space-y-2 group">
              <Label htmlFor="email" className="text-[14px] font-semibold text-[#0F172A] group-focus-within:text-[#FF6B00] transition-colors">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nama@email.com"
                required
                className="h-12 border-[1.5px] border-[#E2E8F0] bg-white rounded-[8px] text-[16px] text-[#0F172A] placeholder:text-[#94A3B8] transition-all duration-200 hover:border-[#CBD5E1] focus-visible:border-[#FF6B00] focus-visible:ring-[3px] focus-visible:ring-[#FF6B00]/15"
              />
            </div>
            <div className="space-y-2 group">
              <Label htmlFor="password" className="text-[14px] font-semibold text-[#0F172A] group-focus-within:text-[#FF6B00] transition-colors">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="h-12 border-[1.5px] border-[#E2E8F0] bg-white rounded-[8px] text-[16px] text-[#0F172A] transition-all duration-200 hover:border-[#CBD5E1] focus-visible:border-[#FF6B00] focus-visible:ring-[3px] focus-visible:ring-[#FF6B00]/15"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-5 pt-6">
            <Button
              type="submit"
              className="w-full h-12 bg-[#FF6B00] hover:bg-[#E05E00] text-white font-bold rounded-[8px] text-[16px] shadow-[0_4px_12px_rgba(255,107,0,0.35)] hover:-translate-y-[1px] active:scale-[0.97] active:translate-y-0 transition-all flex items-center justify-center gap-2 group"
            >
              Masuk Sekarang
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <div className="text-center text-[14px] text-[#64748B]">
              Belum punya akun?{' '}
              <Link href="/register" className="font-bold text-[#0F172A] hover:text-[#FF6B00] transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#FF6B00] hover:after:w-full after:transition-all after:duration-300 inline-block pb-0.5">
                Daftar
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
