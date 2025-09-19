import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyData() {
  console.log('🔍 กำลังตรวจสอบข้อมูลในฐานข้อมูล...')
  console.log('')

  // ตรวจสอบ Users
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true }
  })
  console.log('👥 ผู้ใช้ในระบบ:')
  users.forEach(user => {
    console.log(`  - ${user.name} (${user.email}) - ${user.role}`)
  })
  console.log('')

  // ตรวจสอบ Categories
  const categories = await prisma.category.findMany({
    select: { id: true, name: true, slug: true, isActive: true }
  })
  console.log('🏷️ หมวดหมู่สินค้า:')
  categories.forEach(cat => {
    console.log(`  - ${cat.name} (${cat.slug}) - ${cat.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}`)
  })
  console.log('')

  // ตรวจสอบ Brands
  const brands = await prisma.brand.findMany({
    select: { id: true, name: true, slug: true, isActive: true }
  })
  console.log('🏢 แบรนด์:')
  brands.forEach(brand => {
    console.log(`  - ${brand.name} (${brand.slug}) - ${brand.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}`)
  })
  console.log('')

  // ตรวจสอบ Products
  const products = await prisma.product.findMany({
    select: { 
      id: true, 
      name: true, 
      sku: true, 
      price: true, 
      status: true,
      category: { select: { name: true } },
      brand: { select: { name: true } }
    }
  })
  console.log('📦 สินค้า:')
  products.forEach(product => {
    console.log(`  - ${product.name} (${product.sku})`)
    console.log(`    ราคา: ฿${product.price} | สถานะ: ${product.status}`)
    console.log(`    หมวดหมู่: ${product.category?.name || 'ไม่ระบุ'} | แบรนด์: ${product.brand?.name || 'ไม่ระบุ'}`)
  })
  console.log('')

  // ตรวจสอบ Customers
  const customers = await prisma.customer.findMany({
    select: { 
      id: true, 
      firstName: true, 
      lastName: true, 
      email: true, 
      status: true,
      segment: true,
      totalSpent: true,
      totalOrders: true
    }
  })
  console.log('👤 ลูกค้า:')
  customers.forEach(customer => {
    console.log(`  - ${customer.firstName} ${customer.lastName} (${customer.email})`)
    console.log(`    สถานะ: ${customer.status} | ระดับ: ${customer.segment}`)
    console.log(`    ยอดซื้อ: ฿${customer.totalSpent} | จำนวนออเดอร์: ${customer.totalOrders}`)
  })
  console.log('')

  // ตรวจสอบ Orders
  const orders = await prisma.order.findMany({
    select: { 
      id: true, 
      orderNumber: true, 
      status: true, 
      totalAmount: true,
      customer: { select: { firstName: true, lastName: true } },
      _count: { select: { items: true } }
    }
  })
  console.log('🛒 คำสั่งซื้อ:')
  orders.forEach(order => {
    console.log(`  - ${order.orderNumber} - ${order.status}`)
    console.log(`    ลูกค้า: ${order.customer?.firstName} ${order.customer?.lastName}`)
    console.log(`    ยอดรวม: ฿${order.totalAmount} | สินค้า: ${order._count.items} รายการ`)
  })
  console.log('')

  // ตรวจสอบ Coupons
  const coupons = await prisma.coupon.findMany({
    select: { 
      id: true, 
      code: true, 
      name: true, 
      type: true, 
      value: true,
      status: true,
      usageCount: true,
      usageLimit: true
    }
  })
  console.log('🎫 คูปอง:')
  coupons.forEach(coupon => {
    console.log(`  - ${coupon.code} (${coupon.name})`)
    console.log(`    ประเภท: ${coupon.type} | ค่า: ${coupon.value} | สถานะ: ${coupon.status}`)
    console.log(`    ใช้แล้ว: ${coupon.usageCount}/${coupon.usageLimit || '∞'}`)
  })
  console.log('')

  console.log('✅ ตรวจสอบข้อมูลเสร็จสิ้น!')
}

verifyData()
  .catch((e) => {
    console.error('❌ เกิดข้อผิดพลาด:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })