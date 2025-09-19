import { prisma } from '../src/lib/prisma'
import bcrypt from 'bcryptjs'

async function createTestUsers() {
  try {
    // ลบผู้ใช้เก่าก่อน
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['admin@test.com', 'manager@test.com', 'staff@test.com']
        }
      }
    })

    const hashedPassword = await bcrypt.hash('123456', 12)

    // สร้าง ADMIN user
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE'
      }
    })

    // สร้าง MANAGER user  
    const managerUser = await prisma.user.create({
      data: {
        email: 'manager@test.com',
        name: 'Manager User',
        password: hashedPassword,
        role: 'MANAGER',
        status: 'ACTIVE'
      }
    })

    // สร้าง STAFF user
    const staffUser = await prisma.user.create({
      data: {
        email: 'staff@test.com',
        name: 'Staff User',
        password: hashedPassword,
        role: 'STAFF',
        status: 'ACTIVE'
      }
    })

    console.log('✅ Test users created successfully:')
    console.log('Admin:', adminUser.email, '- Role:', adminUser.role)
    console.log('Manager:', managerUser.email, '- Role:', managerUser.role)
    console.log('Staff:', staffUser.email, '- Role:', staffUser.role)
    console.log('\nPassword for all: 123456')

  } catch (error) {
    console.error('❌ Error creating test users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUsers()