const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    console.log('Creating admin user...')
    
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@test.com' }
    })
    
    if (existingAdmin) {
      console.log('Admin user already exists!')
      return
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash('password', 12)
    
    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        name: 'Admin User',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        emailVerified: new Date()
      }
    })
    
    console.log('Admin user created successfully:', admin.email)
    
    // Create a test customer
    await prisma.customer.create({
      data: {
        email: 'customer@test.com',
        firstName: 'Test',
        lastName: 'Customer',
        status: 'ACTIVE'
      }
    })
    
    console.log('Test customer created successfully')
    
    // Create a test category
    const category = await prisma.category.create({
      data: {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic devices and gadgets',
        isActive: true
      }
    })
    
    // Create a test brand
    const brand = await prisma.brand.create({
      data: {
        name: 'Test Brand',
        slug: 'test-brand',
        description: 'A test brand for demo',
        isActive: true
      }
    })
    
    // Create a test product
    await prisma.product.create({
      data: {
        name: 'Test Product',
        slug: 'test-product',
        sku: 'TEST-001',
        description: 'A test product for demo',
        price: 99.99,
        costPrice: 59.99,
        quantity: 100,
        status: 'ACTIVE',
        categoryId: category.id,
        brandId: brand.id
      }
    })
    
    console.log('Test data created successfully')
    
  } catch (error) {
    console.error('Error creating admin user:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })