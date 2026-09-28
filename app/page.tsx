import { Button, buttonVariants } from '@/components/ui/button'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="flex items-center justify-between p-4 md:px-8 border-b border-slate-200 bg-white">
        <div className="text-xl font-bold text-slate-900 tracking-tight">Tukangin</div>
        <div className="flex gap-2">
          <Link href="/login" className={buttonVariants({ variant: 'outline', className: 'border-slate-200 text-slate-900 rounded-lg' })}>
            Masuk
          </Link>
          <Link href="/register" className={buttonVariants({ className: 'bg-[#FF6B00] hover:bg-[#E05E00] text-white rounded-lg' })}>
            Daftar
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center p-6">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 max-w-2xl leading-tight mb-6 tracking-tight">
          Temukan Tukang Profesional untuk Rumah Anda
        </h1>
        <p className="text-lg text-slate-600 max-w-xl mb-10">
          Solusi terpercaya untuk perbaikan dan perawatan rumah. Cari teknisi ahli, bayar aman, dan nikmati garansi layanan.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl w-full">
          {[
            { title: 'Service AC', icon: '❄️' },
            { title: 'Listrik', icon: '⚡' },
            { title: 'Ledeng', icon: '💧' },
            { title: 'Renovasi', icon: '🔨' }
          ].map((service, i) => (
            <Link key={i} href="/services">
              <div className="flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-[16px] shadow-sm hover:border-[#FF6B00]/50 transition-colors cursor-pointer h-full">
                <div className="text-4xl mb-3">{service.icon}</div>
                <h3 className="font-semibold text-slate-900">{service.title}</h3>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="mt-12">
          <Link href="/login" className={buttonVariants({ className: 'bg-[#FF6B00] hover:bg-[#E05E00] text-white rounded-lg h-14 px-8 text-lg font-semibold' })}>
            Cari Tukang Sekarang
          </Link>
        </div>
      </main>
    </div>
  )
}
