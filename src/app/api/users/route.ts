import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkPermission } from '@/lib/permission-middleware'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    // ตรวจสอบสิทธิ์ในการดูข้อมูลผู้ใช้
    const permissionCheck = await checkPermission('USERS', 'READ')
    if (!permissionCheck.success) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: permissionCheck.message 
        }, 
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } }
      ]
    }

    if (role) {
      where.role = role
    }

    // Execute queries
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          image: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              auditLogs: true,
              createdOrders: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ])

    const pagination = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    }

    return NextResponse.json({
      users,
      pagination
    })

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // ตรวจสอบสิทธิ์ในการสร้างผู้ใช้
    const permissionCheck = await checkPermission('USERS', 'CREATE')
    if (!permissionCheck.success) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: permissionCheck.message 
        }, 
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, email, password, role = 'VIEWER' } = body

    // เฉพาะ SUPER_ADMIN เท่านั้นที่สามารถสร้างผู้ใช้ที่มีบทบาทสูงได้
    if (role !== 'VIEWER' && permissionCheck.userRole !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'เฉพาะ Super Administrator เท่านั้นที่สามารถกำหนดบทบาทพิเศษได้' 
        }, 
        { status: 403 }
      )
    }

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'กรุณากรอกชื่อ อีเมล และรหัสผ่าน' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'รูปแบบอีเมลไม่ถูกต้อง' },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'อีเมลนี้ถูกใช้งานแล้ว' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      message: 'สร้างผู้ใช้สำเร็จ',
      user: newUser
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'ไม่สามารถสร้างผู้ใช้ได้' },
      { status: 500 }
    )
  }
}
