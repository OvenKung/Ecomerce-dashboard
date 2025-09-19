import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        orders: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            status: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        },
        addresses: true
      }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'ไม่พบลูกค้า' },
        { status: 404 }
      )
    }

    return NextResponse.json({ customer })

  } catch (error) {
    console.error('Error fetching customer:', error)
    return NextResponse.json(
      { error: 'ไม่สามารถโหลดข้อมูลลูกค้าได้' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { firstName, lastName, email, phone, status, segment, notes } = body

    // Check if customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { id }
    })

    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'ไม่พบลูกค้า' },
        { status: 404 }
      )
    }

    // Check if email is being changed and already exists
    if (email && email !== existingCustomer.email) {
      const emailExists = await prisma.customer.findUnique({
        where: { email }
      })

      if (emailExists) {
        return NextResponse.json(
          { error: 'อีเมลนี้ถูกใช้งานแล้ว' },
          { status: 400 }
        )
      }
    }

    // Update customer
    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(email && { email }),
        ...(phone !== undefined && { phone }),
        ...(status && { status }),
        ...(segment && { segment }),
        ...(notes !== undefined && { notes })
      }
    })

    return NextResponse.json({
      message: 'อัปเดตข้อมูลลูกค้าสำเร็จ',
      customer: updatedCustomer
    })

  } catch (error) {
    console.error('Error updating customer:', error)
    return NextResponse.json(
      { error: 'ไม่สามารถอัปเดตข้อมูลลูกค้าได้' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { id }
    })

    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'ไม่พบลูกค้า' },
        { status: 404 }
      )
    }

    // Check if customer has orders (prevent deletion if they have orders)
    const orderCount = await prisma.order.count({
      where: { customerId: id }
    })

    if (orderCount > 0) {
      return NextResponse.json(
        { error: 'ไม่สามารถลบลูกค้าที่มีคำสั่งซื้อแล้วได้' },
        { status: 400 }
      )
    }

    // Delete customer
    await prisma.customer.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'ลบลูกค้าสำเร็จ'
    })

  } catch (error) {
    console.error('Error deleting customer:', error)
    return NextResponse.json(
      { error: 'ไม่สามารถลบลูกค้าได้' },
      { status: 500 }
    )
  }
}
