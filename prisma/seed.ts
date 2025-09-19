import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 เริ่มต้น seeding ฐานข้อมูล...')

  // ลบข้อมูลเก่าทั้งหมด
  console.log('🗑️ ลบข้อมูลเก่า...')
  await prisma.orderCoupon.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.order.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.productImage.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.brand.deleteMany()
  await prisma.coupon.deleteMany()
  await prisma.userRole_Mapping.deleteMany()
  await prisma.rolePermission.deleteMany()
  await prisma.user.deleteMany()
  await prisma.role.deleteMany()
  await prisma.permission.deleteMany()
  console.log('✅ ลบข้อมูลเก่าเรียบร้อยแล้ว')

  // สร้าง Users
  const hashedPassword = await hash('admin123', 12)
  
  const adminUser = await prisma.user.create({
    data: {
      name: 'ผู้ดูแลระบบ',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN'
    }
  })

  const managerUser = await prisma.user.create({
    data: {
      name: 'ผู้จัดการ',
      email: 'manager@example.com',
      password: hashedPassword,
      role: 'MANAGER'
    }
  })

  const staffUser = await prisma.user.create({
    data: {
      name: 'พนักงาน',
      email: 'staff@example.com',
      password: hashedPassword,
      role: 'STAFF'
    }
  })

  console.log('✅ สร้างผู้ใช้เรียบร้อยแล้ว')

  // สร้าง Categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'เสื้อผ้า',
        slug: 'clothing',
        description: 'เสื้อผ้าและแฟชั่น',
        isActive: true
      }
    }),
    prisma.category.create({
      data: {
        name: 'อิเล็กทรอนิกส์',
        slug: 'electronics',
        description: 'อุปกรณ์อิเล็กทรอนิกส์',
        isActive: true
      }
    }),
    prisma.category.create({
      data: {
        name: 'ของใช้ในบ้าน',
        slug: 'home',
        description: 'ของใช้ในบ้านและการตกแต่ง',
        isActive: true
      }
    })
  ])

  console.log('✅ สร้างหมวดหมู่เรียบร้อยแล้ว')

  // สร้าง Brands
  const brands = await Promise.all([
    prisma.brand.create({
      data: {
        name: 'Samsung',
        slug: 'samsung',
        description: 'Samsung Electronics',
        website: 'https://samsung.com',
        isActive: true
      }
    }),
    prisma.brand.create({
      data: {
        name: 'Nike',
        slug: 'nike',
        description: 'Nike Sports',
        website: 'https://nike.com',
        isActive: true
      }
    }),
    prisma.brand.create({
      data: {
        name: 'IKEA',
        slug: 'ikea',
        description: 'IKEA Furniture',
        website: 'https://ikea.com',
        isActive: true
      }
    })
  ])

  console.log('✅ สร้างแบรนด์เรียบร้อยแล้ว')

  // สร้าง Products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Galaxy S24',
        slug: 'galaxy-s24',
        description: 'Samsung Galaxy S24 มือถือรุ่นล่าสุด',
        sku: 'SAM-S24-001',
        status: 'ACTIVE',
        price: 29900,
        costPrice: 20000,
        comparePrice: 32900,
        quantity: 50,
        categoryId: categories[1].id,
        brandId: brands[0].id
      }
    }),
    prisma.product.create({
      data: {
        name: 'Air Max 270',
        slug: 'air-max-270',
        description: 'รองเท้า Nike Air Max 270',
        sku: 'NIK-AM270-001',
        status: 'ACTIVE',
        price: 4500,
        costPrice: 3000,
        comparePrice: 5500,
        quantity: 30,
        categoryId: categories[0].id,
        brandId: brands[1].id
      }
    }),
    prisma.product.create({
      data: {
        name: 'HEMNES โต๊ะทำงาน',
        slug: 'hemnes-desk',
        description: 'โต๊ะทำงาน IKEA HEMNES',
        sku: 'IKE-HEM-001',
        status: 'ACTIVE',
        price: 3990,
        costPrice: 2500,
        comparePrice: 4990,
        quantity: 15,
        categoryId: categories[2].id,
        brandId: brands[2].id
      }
    })
  ])

  console.log('✅ สร้างสินค้าเรียบร้อยแล้ว')

  // สร้าง Customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '081-234-5678',
        status: 'ACTIVE',
        segment: 'REGULAR',
        totalSpent: 15000,
        totalOrders: 3
      }
    }),
    prisma.customer.create({
      data: {
        email: 'jane@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '082-345-6789',
        status: 'ACTIVE',
        segment: 'VIP',
        totalSpent: 50000,
        totalOrders: 8
      }
    })
  ])

  console.log('✅ สร้างลูกค้าเรียบร้อยแล้ว')

  // สร้าง Coupons
  const coupons = await Promise.all([
    prisma.coupon.create({
      data: {
        code: 'WELCOME10',
        name: 'ส่วนลดต้อนรับ',
        description: 'ส่วนลด 10% สำหรับสมาชิกใหม่',
        type: 'PERCENTAGE',
        value: 10,
        status: 'ACTIVE',
        usageLimit: 100,
        usageCount: 25,
        minimumAmount: 1000,
        startsAt: new Date('2024-01-01'),
        expiresAt: new Date('2024-12-31')
      }
    }),
    prisma.coupon.create({
      data: {
        code: 'SAVE500',
        name: 'ส่วนลด 500 บาท',
        description: 'ส่วนลดเงินสด 500 บาท',
        type: 'FIXED',
        value: 500,
        status: 'ACTIVE',
        usageLimit: 50,
        usageCount: 10,
        minimumAmount: 5000,
        startsAt: new Date('2024-01-01'),
        expiresAt: new Date('2024-06-30')
      }
    })
  ])

  console.log('✅ สร้างคูปองเรียบร้อยแล้ว')

  // สร้าง Orders
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        orderNumber: 'ORD-2024-001',
        status: 'COMPLETED',
        customerId: customers[0].id,
        customerEmail: customers[0].email,
        shippingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 ถนนสุขุมวิท',
          city: 'กรุงเทพฯ',
          province: 'กรุงเทพมหานคร',
          postalCode: '10110',
          country: 'ไทย'
        },
        subtotal: 29900,
        taxAmount: 2093,
        shippingAmount: 100,
        discountAmount: 2990,
        totalAmount: 29103,
        channel: 'web',
        placedAt: new Date()
      }
    }),
    prisma.order.create({
      data: {
        orderNumber: 'ORD-2024-002',
        status: 'PENDING',
        customerId: customers[1].id,
        customerEmail: customers[1].email,
        shippingAddress: {
          firstName: 'Jane',
          lastName: 'Smith',
          address1: '456 ถนนพหลโยธิน',
          city: 'กรุงเทพฯ',
          province: 'กรุงเทพมหานคร',
          postalCode: '10400',
          country: 'ไทย'
        },
        subtotal: 4500,
        taxAmount: 315,
        shippingAmount: 50,
        discountAmount: 0,
        totalAmount: 4865,
        channel: 'mobile',
        placedAt: new Date()
      }
    })
  ])

  // สร้าง Order Items
  await Promise.all([
    prisma.orderItem.create({
      data: {
        orderId: orders[0].id,
        productId: products[0].id,
        quantity: 1,
        price: 29900,
        totalAmount: 29900,
        productName: products[0].name,
        productSku: products[0].sku
      }
    }),
    prisma.orderItem.create({
      data: {
        orderId: orders[1].id,
        productId: products[1].id,
        quantity: 1,
        price: 4500,
        totalAmount: 4500,
        productName: products[1].name,
        productSku: products[1].sku
      }
    })
  ])

  // สร้าง Payments
  await Promise.all([
    prisma.payment.create({
      data: {
        orderId: orders[0].id,
        amount: 29103,
        method: 'STRIPE',
        status: 'COMPLETED',
        currency: 'THB',
        processedAt: new Date()
      }
    }),
    prisma.payment.create({
      data: {
        orderId: orders[1].id,
        amount: 4865,
        method: 'BANK_TRANSFER',
        status: 'PENDING',
        currency: 'THB'
      }
    })
  ])

  console.log('✅ สร้างคำสั่งซื้อและการชำระเงินเรียบร้อยแล้ว')

  console.log('🎉 Seeding เสร็จสมบูรณ์!')
  console.log('')
  console.log('📊 สรุปข้อมูลที่สร้าง:')
  console.log(`👥 ผู้ใช้: ${await prisma.user.count()} คน`)
  console.log(`🏷️ หมวดหมู่: ${await prisma.category.count()} หมวด`)
  console.log(`🏢 แบรนด์: ${await prisma.brand.count()} แบรนด์`)
  console.log(`📦 สินค้า: ${await prisma.product.count()} รายการ`)
  console.log(`👤 ลูกค้า: ${await prisma.customer.count()} คน`)
  console.log(`🛒 คำสั่งซื้อ: ${await prisma.order.count()} รายการ`)
  console.log(`🎫 คูปอง: ${await prisma.coupon.count()} ใบ`)
  console.log('')
  console.log('🔑 ข้อมูลการเข้าสู่ระบบ:')
  console.log('Admin: admin@example.com / admin123')
  console.log('Manager: manager@example.com / admin123')
  console.log('Staff: staff@example.com / admin123')
}

main()
  .catch((e) => {
    console.error('❌ เกิดข้อผิดพลาดในการ seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
