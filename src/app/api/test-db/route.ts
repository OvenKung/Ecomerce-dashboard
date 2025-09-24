import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  // Require authenticated session to avoid exposing sensitive DB info
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized', message: 'กรุณาเข้าสู่ระบบก่อนดำเนินการ' }, { status: 401 })
  }
  try {
    console.log('🔍 Testing database connection...')
    
    // Test database connection
    const userCount = await prisma.user.count()
    console.log('✅ Database connected. User count:', userCount)
    
    // Test specific admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@test.com' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        password: true
      }
    })
    
    console.log('🔍 Admin user found:', {
      exists: !!adminUser,
      email: adminUser?.email,
      role: adminUser?.role,
      status: adminUser?.status,
      hasPassword: !!adminUser?.password
    })
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        userCount,
        adminExists: !!adminUser,
        adminEmail: adminUser?.email,
        adminRole: adminUser?.role,
        adminStatus: adminUser?.status,
        adminHasPassword: !!adminUser?.password
      }
    })
    
  } catch (error) {
    console.error('❌ Database connection error:', error)
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}