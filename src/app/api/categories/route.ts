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
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const parentId = searchParams.get('parentId');

    const whereClause: any = {};

    // Filter by active status
    if (!includeInactive) {
      whereClause.isActive = true;
    }

    // Filter by parent ID
    if (parentId !== null) {
      if (parentId === 'null' || parentId === '') {
        whereClause.parentId = null;
      } else {
        whereClause.parentId = parentId;
      }
    }

    const categories = await prisma.category.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            products: true,
            children: true
          }
        },
        parent: true,
        children: {
          where: includeInactive ? {} : { isActive: true }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({
      categories,
      total: categories.length
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, description, parentId } = body;

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug }
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400 }
      );
    }

    // Create new category
    const newCategory = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || '',
        parentId: parentId || null,
        isActive: true
      },
      include: {
        _count: {
          select: {
            products: true,
            children: true
          }
        },
        parent: true
      }
    });

    return NextResponse.json({
      message: 'Category created successfully',
      category: newCategory
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
