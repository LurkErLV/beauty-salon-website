import { PrismaClient } from '../src/generated/prisma/client.js'

import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding preorder products...')

  await prisma.product.createMany({
    data: [
      {
        name: 'Keune Care Satin Oil Shampoo',
        brand: 'Keune',
        description:
          'A salon shampoo for soft shine and smoother everyday hair care.',
        priceCents: 2400,
        currency: 'CHF',
        inStock: true,
      },
      {
        name: 'Keune Care Vital Nutrition Mask',
        brand: 'Keune',
        description:
          'A nourishing mask for dry or stressed hair, reserved for salon pickup.',
        priceCents: 3200,
        currency: 'CHF',
        inStock: true,
      },
      {
        name: 'Brow Styling Gel',
        brand: 'Île de Beauté',
        description:
          'A compact finishing product for polished brows between appointments.',
        priceCents: 1800,
        currency: 'CHF',
        inStock: false,
      },
    ],
    skipDuplicates: true,
  })

  console.log('Seed complete')
}

main()
  .catch((error) => {
    console.error('Seed failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
