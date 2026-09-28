import { db } from '@/lib/db'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'

export default async function ServicesPage() {
  const categories = await db.serviceCategory.findMany()

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-[28px] md:text-[36px] font-extrabold text-[#0F172A] tracking-tight">Kategori Layanan</h1>
          <p className="text-[16px] text-[#334155] mt-2">Pilih jenis layanan untuk mencari Mitra Tukang terpercaya.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map(category => (
            <Link key={category.id} href={`/services/${category.id}`}>
              <Card className="hover:border-[#CBD5E1] hover:shadow-md transition-all duration-200 border-[#E2E8F0] rounded-[16px] bg-white cursor-pointer h-full">
                <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <div className="text-4xl">{category.icon}</div>
                  <div>
                    <h3 className="text-[16px] font-bold text-[#0F172A]">{category.name}</h3>
                    <p className="text-[12px] text-[#64748B] mt-1 line-clamp-2">{category.description}</p>
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
