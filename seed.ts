import { db as prisma } from './lib/db'
import bcrypt from 'bcryptjs'

async function main() {
  await prisma.providerService.deleteMany()
  await prisma.serviceCategory.deleteMany()
  await prisma.providerProfile.deleteMany()
  await prisma.user.deleteMany()
  // 1. Kategori Layanan
  const categoriesData = [
    { name: 'Service AC', icon: '❄️' },
    { name: 'Listrik', icon: '⚡' },
    { name: 'Ledeng', icon: '💧' },
    { name: 'Renovasi', icon: '🔨' },
  ]

  const categories = []
  for (const cat of categoriesData) {
    const created = await prisma.serviceCategory.create({
      data: {
        name: cat.name,
        icon: cat.icon,
        description: `Layanan profesional untuk ${cat.name}`
      }
    })
    categories.push(created)
  }
  console.log('✅ Seeded Service Categories')

  // 2. Mitra Tukang (Providers)
  const providersData = [
    { name: 'Budi AC Servis', email: 'budi@example.com', exp: 5, catName: 'Service AC' },
    { name: 'Agus Kelistrikan', email: 'agus@example.com', exp: 8, catName: 'Listrik' },
    { name: 'Tono Pipa Air', email: 'tono@example.com', exp: 3, catName: 'Ledeng' },
    { name: 'Joko Bangunan', email: 'joko@example.com', exp: 12, catName: 'Renovasi' },
  ]

  const hashedPassword = await bcrypt.hash('password123', 10)

  for (const p of providersData) {
    const user = await prisma.user.create({
      data: {
        name: p.name,
        email: p.email,
        password: hashedPassword,
        role: 'PROVIDER',
        providerProfile: {
          create: {
            phone: '081234567890',
            address: 'Jl. Sudirman, Jakarta',
            businessName: p.name,
            description: `Ahli ${p.catName} yang handal dan berpengalaman.`,
            experience: p.exp,
            isVerified: true,
            ktpNumber: '1234567890123456'
          }
        }
      },
      include: { providerProfile: true }
    })

    // Hubungkan Provider dengan Kategori (ProviderService)
    const category = categories.find(c => c.name === p.catName)
    if (category && user.providerProfile) {
      await prisma.providerService.create({
        data: {
          providerProfileId: user.providerProfile.id,
          serviceCategoryId: category.id,
          price: 150000 + (p.exp * 10000) // Harga simulasi berdasarkan pengalaman
        }
      })
    }
  }

  console.log('✅ Seeded Mitra Tukang (Providers)')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
