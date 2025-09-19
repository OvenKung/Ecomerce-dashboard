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

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                price: true,
                images: true
              }
            }
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'ไม่พบคำสั่งซื้อ' },
        { status: 404 }
      )
    }

    return NextResponse.json({ order })

  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'ไม่สามารถโหลดข้อมูลคำสั่งซื้อได้' },
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
    const { status, notes, trackingNumber } = body

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id }
    })

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'ไม่พบคำสั่งซื้อ' },
        { status: 404 }
      )
    }

    // Check if order can be modified
    if (existingOrder.status === 'COMPLETED' || existingOrder.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'ไม่สามารถแก้ไขคำสั่งซื้อที่เสร็จสมบูรณ์หรือยกเลิกแล้วได้' },
        { status: 400 }
      )
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        ...(trackingNumber !== undefined && { trackingNumber })
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                price: true,
                images: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      message: 'อัปเดตคำสั่งซื้อสำเร็จ',
      order: updatedOrder
    })

  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'ไม่สามารถอัปเดตคำสั่งซื้อได้' },
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

    // Only admin can delete orders
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id }
    })

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'ไม่พบคำสั่งซื้อ' },
        { status: 404 }
      )
    }

    // Only allow deletion of cancelled or pending orders
    if (existingOrder.status !== 'CANCELLED' && existingOrder.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'สามารถลบได้เฉพาะคำสั่งซื้อที่ยกเลิกหรือรอดำเนินการเท่านั้น' },
        { status: 400 }
      )
    }

    // Delete order items first
    await prisma.orderItem.deleteMany({
      where: { orderId: id }
    })

    // Delete order
    await prisma.order.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'ลบคำสั่งซื้อสำเร็จ'
    })

  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json(
      { error: 'ไม่สามารถลบคำสั่งซื้อได้' },
      { status: 500 }
    )
  }
}
