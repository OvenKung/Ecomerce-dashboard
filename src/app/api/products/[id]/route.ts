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

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        images: true
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'ไม่พบสินค้า' },
        { status: 404 }
      )
    }

    return NextResponse.json({ product })

  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'ไม่สามารถโหลดข้อมูลสินค้าได้' },
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

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'ไม่พบสินค้า' },
        { status: 404 }
      )
    }

    // Check if SKU is being changed and already exists
    if (sku && sku !== existingProduct.sku) {
      const skuExists = await prisma.product.findUnique({
        where: { sku }
      })

      if (skuExists) {
        return NextResponse.json(
          { error: 'SKU นี้ถูกใช้งานแล้ว' },
          { status: 400 }
        )
      }
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(sku && { sku }),
        ...(barcode !== undefined && { barcode }),
        ...(price && { price: parseFloat(price.toString()) }),
        ...(costPrice !== undefined && { costPrice: costPrice ? parseFloat(costPrice.toString()) : null }),
        ...(comparePrice !== undefined && { comparePrice: comparePrice ? parseFloat(comparePrice.toString()) : null }),
        ...(quantity !== undefined && { quantity: parseInt(quantity.toString()) }),
        ...(trackQuantity !== undefined && { trackQuantity }),
        ...(categoryId !== undefined && { categoryId }),
        ...(brandId !== undefined && { brandId }),
        ...(status && { status })
      },
      include: {
        category: true,
        brand: true,
        images: true
      }
    })

    return NextResponse.json({
      message: 'อัปเดตสินค้าสำเร็จ',
      product: updatedProduct
    })

  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'ไม่สามารถอัปเดตสินค้าได้' },
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

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'ไม่พบสินค้า' },
        { status: 404 }
      )
    }

    // Check if product has orders (prevent deletion if it has orders)
    const orderCount = await prisma.orderItem.count({
      where: { productId: id }
    })

    if (orderCount > 0) {
      return NextResponse.json(
        { error: 'ไม่สามารถลบสินค้าที่มีคำสั่งซื้อแล้วได้' },
        { status: 400 }
      )
    }

    // Delete product
    await prisma.product.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'ลบสินค้าสำเร็จ'
    })

  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'ไม่สามารถลบสินค้าได้' },
      { status: 500 }
    )
  }
}
