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
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build where clause for date filtering
    const where: any = {}
    
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    // Calculate total revenue from orders
    const orders = await prisma.order.findMany({
      where: {
        ...where,
        status: 'COMPLETED' // Only count completed orders
      },
      select: {
        totalAmount: true,
        createdAt: true
      }
    })

    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0)

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue,
        orderCount: orders.length
      }
    })

  } catch (error) {
    console.error('Error fetching revenue:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}