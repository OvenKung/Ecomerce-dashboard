import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const type = searchParams.get('type') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;
    const now = new Date();

    // Build where clause
    const whereClause: any = {};

    // Search filter
    if (search) {
      whereClause.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Status filter
    if (status === 'active') {
      whereClause.AND = [
        { status: 'ACTIVE' },
        { startsAt: { lte: now } },
        { expiresAt: { gte: now } }
      ];
    } else if (status === 'inactive') {
      whereClause.status = 'INACTIVE';
    } else if (status === 'expired') {
      whereClause.expiresAt = { lt: now };
    }

    // Type filter
    if (type) {
      whereClause.type = type;
    }

    // Build order by clause
    const orderByClause: any = {};
    orderByClause[sortBy] = sortOrder;

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        where: whereClause,
        orderBy: orderByClause,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              orders: true
            }
          }
        }
      }),
      prisma.coupon.count({ where: whereClause })
    ]);

    // Transform data to match frontend expectations
    const transformedCoupons = coupons.map(coupon => ({
      ...coupon,
      usageCount: coupon._count.orders,
      // Convert field names for frontend compatibility
      isActive: coupon.status === 'ACTIVE',
      startDate: coupon.startsAt,
      endDate: coupon.expiresAt,
      minimumOrder: coupon.minimumAmount,
      maximumDiscount: coupon.maximumDiscount,
      applicableProducts: coupon.applicableProducts || [],
      applicableCategories: coupon.applicableCategories || []
    }));

    return NextResponse.json({
      coupons: transformedCoupons,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      code,
      name,
      description,
      type,
      value,
      minimumOrder,
      maximumDiscount,
      usageLimit,
      startDate,
      endDate,
      applicableProducts,
      applicableCategories
    } = body;

    // Validate required fields
    if (!code || !name || !type || value === undefined) {
      return NextResponse.json(
        { error: 'Code, name, type and value are required' },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code }
    });

    if (existingCoupon) {
      return NextResponse.json(
        { error: 'Coupon code already exists' },
        { status: 400 }
      );
    }

    // Create coupon
    const newCoupon = await prisma.coupon.create({
      data: {
        code,
        name,
        description: description || '',
        type,
        value,
        minimumAmount: minimumOrder || 0,
        maximumDiscount: maximumDiscount || null,
        usageLimit: usageLimit || null,
        status: 'ACTIVE',
        startsAt: startDate ? new Date(startDate) : new Date(),
        expiresAt: endDate ? new Date(endDate) : null,
        applicableProducts: applicableProducts || null,
        applicableCategories: applicableCategories || null
      },
      include: {
        _count: {
          select: {
            orders: true
          }
        }
      }
    });

    // Transform response to match frontend expectations
    const transformedCoupon = {
      ...newCoupon,
      usageCount: newCoupon._count.orders,
      isActive: newCoupon.status === 'ACTIVE',
      startDate: newCoupon.startsAt,
      endDate: newCoupon.expiresAt,
      minimumOrder: newCoupon.minimumAmount,
      maximumDiscount: newCoupon.maximumDiscount,
      applicableProducts: newCoupon.applicableProducts || [],
      applicableCategories: newCoupon.applicableCategories || []
    };

    return NextResponse.json({
      message: 'Coupon created successfully',
      coupon: transformedCoupon
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating coupon:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}