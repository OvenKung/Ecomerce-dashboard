import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const coupon = await prisma.coupon.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            orders: true
          }
        }
      }
    })

    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
    }

    return NextResponse.json({ coupon })

  } catch (error) {
    console.error('Error fetching coupon:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      code,
      name,
      description,
      type,
      value,
      minimumAmount,
      maximumDiscount,
      usageLimit,
      status,
      isActive, // Handle both status and isActive
      startsAt,
      expiresAt
    } = body

    // Check if coupon exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { id: params.id }
    })

    if (!existingCoupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
    }

    // Check if code already exists (excluding current coupon)
    if (code && code !== existingCoupon.code) {
      const codeExists = await prisma.coupon.findUnique({
        where: { 
          code,
          NOT: { id: params.id }
        }
      })

      if (codeExists) {
        return NextResponse.json(
          { error: 'Coupon code already exists' },
          { status: 400 }
        )
      }
    }

    // Determine the correct status value
    let finalStatus = status
    if (isActive !== undefined) {
      finalStatus = isActive ? 'ACTIVE' : 'INACTIVE'
    }

    // Update coupon
    const updatedCoupon = await prisma.coupon.update({
      where: { id: params.id },
      data: {
        ...(code && { code }),
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(type && { type }),
        ...(value !== undefined && { value }),
        ...(minimumAmount !== undefined && { minimumAmount }),
        ...(maximumDiscount !== undefined && { maximumDiscount }),
        ...(usageLimit !== undefined && { usageLimit }),
        ...(finalStatus !== undefined && { status: finalStatus }),
        ...(startsAt && { startsAt: new Date(startsAt) }),
        ...(expiresAt && { expiresAt: new Date(expiresAt) })
      },
      include: {
        _count: {
          select: {
            orders: true
          }
        }
      }
    })

    // Transform response to match frontend expectations
    const transformedCoupon = {
      ...updatedCoupon,
      usageCount: updatedCoupon._count.orders,
      isActive: updatedCoupon.status === 'ACTIVE',
      startDate: updatedCoupon.startsAt,
      endDate: updatedCoupon.expiresAt,
      minimumOrder: updatedCoupon.minimumAmount
    }

    return NextResponse.json({ 
      message: 'Coupon updated successfully',
      coupon: transformedCoupon 
    })

  } catch (error) {
    console.error('Error updating coupon:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if coupon exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            orders: true
          }
        }
      }
    })

    if (!existingCoupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
    }

    // Check if coupon has been used in orders
    if (existingCoupon._count.orders > 0) {
      // Instead of deleting, mark as inactive
      await prisma.coupon.update({
        where: { id: params.id },
        data: { status: 'INACTIVE' }
      })

      return NextResponse.json({ 
        message: 'Coupon deactivated successfully (has order history)' 
      })
    } else {
      // Safe to delete if no orders
      await prisma.coupon.delete({
        where: { id: params.id }
      })

      return NextResponse.json({ 
        message: 'Coupon deleted successfully' 
      })
    }

  } catch (error) {
    console.error('Error deleting coupon:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}