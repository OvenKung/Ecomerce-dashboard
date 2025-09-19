import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin role for updating
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    const body = await request.json();
    const { name, slug, description, logo, website, isActive } = body;

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    // Check if brand exists and get current data
    const existingBrand = await prisma.brand.findUnique({
      where: { id }
    });

    if (!existingBrand) {
      return NextResponse.json(
        { error: 'ยี่ห้อไม่พบ' },
        { status: 404 }
      );
    }

    // Check for duplicate name (excluding current brand)
    if (name && name !== existingBrand.name) {
      const duplicateNameBrand = await prisma.brand.findFirst({
        where: {
          name,
          NOT: { id }
        }
      });

      if (duplicateNameBrand) {
        return NextResponse.json(
          { error: 'ชื่อยี่ห้อนี้มีอยู่แล้ว' },
          { status: 400 }
        );
      }
    }

    // Update brand
    const updatedBrand = await prisma.brand.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(website && { website }),
        ...(logo && { logo }),
        ...(isActive !== undefined && { isActive })
      }
    });

    return NextResponse.json({
      message: 'Brand updated successfully',
      brand: updatedBrand
    });

  } catch (error) {
    console.error('Error updating brand:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if user has admin role
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if brand exists
    const existingBrand = await prisma.brand.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });

    if (!existingBrand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      );
    }

    // Check if brand has products
    if (existingBrand._count.products > 0) {
      return NextResponse.json(
        { error: 'Cannot delete brand with products. Please move or delete products first.' },
        { status: 400 }
      );
    }

    // Delete brand
    await prisma.brand.delete({
      where: { id }
    });

    return NextResponse.json({
      message: 'Brand deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting brand:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const brand = await prisma.brand.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            products: true
          }
        },
        products: {
          take: 10,
          include: {
            category: true,
            _count: {
              select: {
                orderItems: true
              }
            }
          }
        }
      }
    });

    if (!brand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      brand
    });

  } catch (error) {
    console.error('Error fetching brand:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}