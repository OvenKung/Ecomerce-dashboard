import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } }
      ]
    }

    if (status) {
      where.status = status
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    // Execute queries
    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          orders: {
            select: {
              id: true,
              totalAmount: true,
              status: true,
              createdAt: true
            }
          },
          addresses: true  // Include addresses for completeness
        }
      }),
      prisma.customer.count({ where })
    ])

    // Format customers data
    const formattedCustomers = customers.map(customer => ({
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      status: customer.status,
      segment: customer.segment,
      addresses: customer.addresses || [],  // Include addresses
      totalSpent: customer.orders.reduce((sum, order) => sum + Number(order.totalAmount), 0),
      totalOrders: customer.orders.length,
      lastOrderDate: customer.orders.length > 0 
        ? customer.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].createdAt
        : null,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt
    }))

    const pagination = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    }

    return NextResponse.json({
      customers: formattedCustomers,
      pagination
    })

  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { error: 'ไม่สามารถโหลดข้อมูลลูกค้าได้' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { firstName, lastName, email, phone, status, segment } = body

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { email }
    })

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'อีเมลนี้ถูกใช้งานแล้ว' },
        { status: 400 }
      )
    }

    // Create new customer
    const customer = await prisma.customer.create({
      data: {
        firstName,
        lastName,
        email,
        phone: phone || null,
        status: status || 'ACTIVE',
        segment: segment || 'REGULAR'
      }
    })

    return NextResponse.json({
      message: 'สร้างลูกค้าใหม่สำเร็จ',
      customer
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating customer:', error)
    return NextResponse.json(
      { error: 'ไม่สามารถสร้างลูกค้าใหม่ได้' },
      { status: 500 }
    )
  }
}
