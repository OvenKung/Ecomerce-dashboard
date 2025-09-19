import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Start seeding...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      status: 'ACTIVE'
    }
  })

  // Create categories
  const electronics = await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Electronic devices and gadgets'
    }
  })

  const clothing = await prisma.category.upsert({
    where: { slug: 'clothing' },
    update: {},
    create: {
      name: 'Clothing',
      slug: 'clothing',
      description: 'Fashion and apparel'
    }
  })

  // Create brands
  const apple = await prisma.brand.upsert({
    where: { slug: 'apple' },
    update: {},
    create: {
      name: 'Apple',
      slug: 'apple',
      description: 'Apple Inc.'
    }
  })

  const nike = await prisma.brand.upsert({
    where: { slug: 'nike' },
    update: {},
    create: {
      name: 'Nike',
      slug: 'nike',
      description: 'Nike Inc.'
    }
  })

  // Create products
  const iphone = await prisma.product.upsert({
    where: { sku: 'IPHONE-15-128' },
    update: {},
    create: {
      name: 'iPhone 15 128GB',
      slug: 'iphone-15-128gb',
      sku: 'IPHONE-15-128',
      description: 'Latest iPhone with amazing features',
      price: 35900,
      costPrice: 25000,
      quantity: 50,
      categoryId: electronics.id,
      brandId: apple.id,
      status: 'ACTIVE'
    }
  })

  const shoes = await prisma.product.upsert({
    where: { sku: 'NIKE-AIR-MAX-42' },
    update: {},
    create: {
      name: 'Nike Air Max 90',
      slug: 'nike-air-max-90',
      sku: 'NIKE-AIR-MAX-42',
      description: 'Classic Nike Air Max shoes',
      price: 4900,
      costPrice: 2500,
      quantity: 25,
      categoryId: clothing.id,
      brandId: nike.id,
      status: 'ACTIVE'
    }
  })

  // Create customers
  const customer1 = await prisma.customer.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '0812345678',
      segment: 'VIP',
      status: 'ACTIVE'
    }
  })

  const customer2 = await prisma.customer.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: {
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '0887654321',
      segment: 'REGULAR',
      status: 'ACTIVE'
    }
  })

  // Create orders
  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-001',
      customerEmail: customer1.email,
      customerId: customer1.id,
      subtotal: 35900,
      taxAmount: 2513,
      shippingAmount: 100,
      totalAmount: 38513,
      status: 'COMPLETED',
      shippingAddress: {
        firstName: 'John',
        lastName: 'Doe',
        address1: '123 Main St',
        city: 'Bangkok',
        province: 'Bangkok',
        postalCode: '10100',
        country: 'TH'
      },
      items: {
        create: {
          productId: iphone.id,
          quantity: 1,
          price: 35900,
          totalAmount: 35900,
          productName: 'iPhone 15 128GB',
          productSku: 'IPHONE-15-128'
        }
      }
    }
  })

  console.log('✅ Seeding completed')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
