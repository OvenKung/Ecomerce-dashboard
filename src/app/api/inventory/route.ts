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
    const lowStock = searchParams.get('lowStock') === 'true'

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      trackQuantity: true // Only show products that track quantity
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { barcode: { contains: search } }
      ]
    }

    if (lowStock) {
      where.quantity = {
        lte: 10 // Products with 10 or fewer items in stock
      }
    }

    // Execute queries
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { quantity: 'asc' }, // Show lowest stock first
        skip,
        take: limit,
        include: {
          category: {
            select: {
              id: true,
              name: true
            }
          },
          brand: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }),
      prisma.product.count({ where })
    ])

    // Format inventory data
    const formattedInventory = products.map(product => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      price: Number(product.price),
      quantity: product.quantity,
      status: product.status,
      category: product.category,
      brand: product.brand,
      stockLevel: product.quantity <= 5 ? 'critical' : 
                 product.quantity <= 10 ? 'low' : 
                 product.quantity <= 20 ? 'medium' : 'high',
      lastUpdated: product.updatedAt,
      createdAt: product.createdAt
    }))

    const pagination = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    }

    // Calculate stock statistics
    const stockStats = {
      totalProducts: total,
      criticalStock: products.filter(p => p.quantity <= 5).length,
      lowStock: products.filter(p => p.quantity <= 10).length,
      averageStock: products.length > 0 
        ? Math.round(products.reduce((sum, p) => sum + p.quantity, 0) / products.length)
        : 0
    }

    return NextResponse.json({
      inventory: formattedInventory,
      pagination,
      stats: stockStats
    })

  } catch (error) {
    console.error('Error fetching inventory:', error)
    return NextResponse.json(
      { error: 'ไม่สามารถโหลดข้อมูลสินค้าคงคลังได้' },
      { status: 500 }
    )
  }
}
