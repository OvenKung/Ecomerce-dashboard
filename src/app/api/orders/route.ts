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

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customer: {
          OR: [
            { firstName: { contains: search } },
            { lastName: { contains: search } },
            { email: { contains: search } }
          ]
        }}
      ]
    }

    if (status) {
      where.status = status
    }

    // Execute queries
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                  price: true
                }
              }
            }
          }
        }
      }),
      prisma.order.count({ where })
    ])

    // Format orders data
    const formattedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customer: order.customer,
      status: order.status,
      total: Number(order.totalAmount),
      subtotal: Number(order.subtotal),
      tax: Number(order.taxAmount),
      shipping: Number(order.shippingAmount),
      customerEmail: order.customerEmail,
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,
      items: order.items.map(item => ({
        id: item.id,
        product: item.product,
        quantity: item.quantity,
        price: Number(item.price),
        total: Number(item.price) * item.quantity
      })),
      itemCount: order.items.length,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
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
      orders: formattedOrders,
      pagination
    })

  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'ไม่สามารถโหลดข้อมูลคำสั่งซื้อได้' },
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
    const { customerId, orderItems, notes, shippingAddress } = body

    // Validate required fields
    if (!customerId || !orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return NextResponse.json(
        { error: 'กรุณาระบุลูกค้าและรายการสินค้า' },
        { status: 400 }
      )
    }

    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลลูกค้า' },
        { status: 400 }
      )
    }

    // Validate order items and calculate total
    let totalAmount = 0
    const validatedItems = []

    for (const item of orderItems) {
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        return NextResponse.json(
          { error: 'ข้อมูลรายการสินค้าไม่ถูกต้อง' },
          { status: 400 }
        )
      }

      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: {
          id: true,
          name: true,
          sku: true,
          price: true,
          quantity: true
        }
      })

      if (!product) {
        return NextResponse.json(
          { error: `ไม่พบสินค้า ID: ${item.productId}` },
          { status: 400 }
        )
      }

      if (product.quantity < item.quantity) {
        return NextResponse.json(
          { error: `สินค้า ${product.name} มีสต๊อกไม่เพียงพอ` },
          { status: 400 }
        )
      }

      const itemTotal = Number(product.price) * item.quantity
      totalAmount += itemTotal

      validatedItems.push({
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        quantity: item.quantity,
        price: product.price,
        totalAmount: itemTotal
      })
    }

    // Generate order number
    const orderCount = await prisma.order.count()
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(orderCount + 1).padStart(6, '0')}`

    // Create order with items
    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        customerId,
        customerEmail: customer.email,
        totalAmount,
        subtotal: totalAmount,
        status: 'PENDING',
        notes,
        createdById: session.user.id,
        shippingAddress: shippingAddress || {},
        items: {
          create: validatedItems
        }
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

    // Update product stock
    for (const item of validatedItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          quantity: {
            decrement: item.quantity
          }
        }
      })
    }

    return NextResponse.json({
      message: 'สร้างคำสั่งซื้อสำเร็จ',
      order: newOrder
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'ไม่สามารถสร้างคำสั่งซื้อได้' },
      { status: 500 }
    )
  }
}
