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
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { sku: { contains: search } }
      ]
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    // Execute queries
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          category: true,
          brand: true
        }
      }),
      prisma.product.count({ where })
    ])

    // Format products data
    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
      sku: product.sku,
      barcode: product.barcode,
      trackQuantity: product.trackQuantity,
      quantity: product.quantity,
      categoryId: product.categoryId,
      brandId: product.brandId,
      status: product.status,
      images: [], 
      category: product.category,
      brand: product.brand,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
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
      products: formattedProducts,
      pagination
    })

  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'ไม่สามารถโหลดข้อมูลสินค้าได้' },
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
    const { 
      name, 
      description, 
      sku, 
      barcode, 
      price, 
      costPrice, 
      comparePrice, 
      quantity, 
      categoryId, 
      brandId, 
      status,
      trackQuantity 
    } = body

    // Validate required fields
    if (!name || !sku || !price) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (ชื่อสินค้า, SKU, ราคา)' },
        { status: 400 }
      )
    }

    // Check if SKU already exists
    const existingProduct = await prisma.product.findUnique({
      where: { sku }
    })

    if (existingProduct) {
      return NextResponse.json(
        { error: 'SKU นี้ถูกใช้งานแล้ว' },
        { status: 400 }
      )
    }

    // Generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9\u0E00-\u0E7F]+/g, '-')
      .replace(/^-+|-+$/g, '')

    // Create new product
    const product = await prisma.product.create({
      data: {
        name,
        slug: `${slug}-${Date.now()}`, // Add timestamp to ensure uniqueness
        description: description || null,
        sku,
        barcode: barcode || null,
        price: parseFloat(price),
        costPrice: costPrice ? parseFloat(costPrice) : null,
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        quantity: parseInt(quantity) || 0,
        trackQuantity: trackQuantity !== false,
        categoryId: categoryId || null,
        brandId: brandId || null,
        status: status || 'DRAFT'
      },
      include: {
        category: true,
        brand: true
      }
    })

    return NextResponse.json({
      message: 'สร้างสินค้าใหม่สำเร็จ',
      product
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'ไม่สามารถสร้างสินค้าใหม่ได้' },
      { status: 500 }
    )
  }
}
