import { db } from '@/lib/db'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Hammer, Zap, Fan, Droplet, ArrowRight } from 'lucide-react'

const getIcon = (name: string) => {
  const lower = name.toLowerCase()
  if (lower.includes('listrik')) return <Zap className="w-10 h-10 text-blue-500" />
  if (lower.includes('ac')) return <Fan className="w-10 h-10 text-cyan-500" />
  if (lower.includes('air') || lower.includes('pipa')) return <Droplet className="w-10 h-10 text-blue-400" />
  return <Hammer className="w-10 h-10 text-[#FF6B00]" />
}

export default async function ServicesPage() {
  const categories = await db.serviceCategory.findMany()

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 animate-in fade-in duration-300">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-[28px] md:text-[36px] font-extrabold text-[#0F172A] tracking-tight">Kategori Layanan</h1>
          <p className="text-[16px] text-[#334155] mt-2">Pilih jenis layanan untuk mencari Mitra Tukang terpercaya.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map(category => (
            <Link key={category.id} href={`/services/${category.id}`} className="group h-full">
              <Card className="h-full hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(15,23,42,0.08)] hover:border-[#CBD5E1] transition-all duration-300 border-[#E2E8F0] rounded-[16px] bg-white cursor-pointer relative overflow-hidden">
                <CardContent className="flex flex-col items-center justify-center p-8 text-center h-full">
                  <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300">
                    {getIcon(category.name)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#0F172A] group-hover:text-[#FF6B00] transition-colors">{category.name}</h3>
                    <p className="text-sm text-[#64748B] mt-2 line-clamp-2 leading-relaxed">{category.description}</p>
                  </div>
                  <div className="mt-6 flex items-center gap-2 text-sm font-bold text-[#FF6B00] opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                    Cari Tukang <ArrowRight className="w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
