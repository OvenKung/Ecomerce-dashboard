import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
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

    const skip = (page - 1) * limit;

    // Build SQL query
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    
    if (search) {
      whereClause += ` AND (name LIKE ? OR description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (status) {
      whereClause += ` AND status = ?`;
      params.push(status.toUpperCase());
    }
    
    if (type) {
      whereClause += ` AND type = ?`;
      params.push(type);
    }

    // Get campaigns using raw SQL
    const campaigns = await prisma.$queryRawUnsafe(`
      SELECT * FROM campaigns 
      ${whereClause}
      ORDER BY createdAt DESC
      LIMIT ? OFFSET ?
    `, ...params, limit, skip);

    const totalResult = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count FROM campaigns ${whereClause}
    `, ...params);

    const total = Number((totalResult as any)[0].count);

    // Transform data to include calculated metrics
    const transformedCampaigns = (campaigns as any[]).map((campaign: any) => {
      const ctr = campaign.impressions > 0 ? (campaign.clicks / campaign.impressions) * 100 : 0;
      const conversionRate = campaign.clicks > 0 ? (campaign.conversions / campaign.clicks) * 100 : 0;
      const roas = campaign.spent > 0 ? campaign.revenue / campaign.spent : 0;
      const cpa = campaign.conversions > 0 ? campaign.spent / campaign.conversions : 0;

      return {
        ...campaign,
        metrics: {
          ctr: Number(ctr.toFixed(2)),
          conversionRate: Number(conversionRate.toFixed(2)),
          roas: Number(roas.toFixed(2)),
          cpa: Number(cpa.toFixed(2))
        }
      };
    });

    return NextResponse.json({
      campaigns: transformedCampaigns,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'type', 'status', 'startDate', 'endDate', 'budget'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Validate status
    const validStatuses = ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json({ 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      }, { status: 400 });
    }

    // Validate type
    const validTypes = ['EMAIL_CAMPAIGN', 'SOCIAL_MEDIA', 'DISCOUNT_CAMPAIGN', 'PRODUCT_LAUNCH', 'SEASONAL', 'RETARGETING'];
    if (!validTypes.includes(body.type)) {
      return NextResponse.json({ 
        error: `Invalid type. Must be one of: ${validTypes.join(', ')}` 
      }, { status: 400 });
    }

    // Validate dates
    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);
    
    if (startDate >= endDate) {
      return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 });
    }

    // Generate ID
    const id = Math.random().toString(36).substring(2) + Date.now().toString(36);

    // Create campaign using raw SQL
    await prisma.$executeRaw`
      INSERT INTO campaigns (
        id, name, description, type, status, startDate, endDate, budget, 
        spent, impressions, clicks, conversions, revenue, targetAudience, 
        channels, products, createdAt, updatedAt
      ) VALUES (
        ${id}, ${body.name}, ${body.description || ''}, ${body.type}, ${body.status},
        ${startDate.toISOString()}, ${endDate.toISOString()}, ${body.budget || 0},
        ${body.spent || 0}, ${body.impressions || 0}, ${body.clicks || 0}, 
        ${body.conversions || 0}, ${body.revenue || 0}, 
        ${JSON.stringify(body.targetAudience || [])},
        ${JSON.stringify(body.channels || [])}, 
        ${JSON.stringify(body.products || [])},
        ${new Date().toISOString()}, ${new Date().toISOString()}
      )
    `;

    // Get the created campaign
    const newCampaign = await prisma.$queryRaw`
      SELECT * FROM campaigns WHERE id = ${id}
    `;

    const campaign = (newCampaign as any[])[0];

    // Calculate metrics
    const ctr = campaign.impressions > 0 ? (campaign.clicks / campaign.impressions) * 100 : 0;
    const conversionRate = campaign.clicks > 0 ? (campaign.conversions / campaign.clicks) * 100 : 0;
    const roas = campaign.spent > 0 ? campaign.revenue / campaign.spent : 0;
    const cpa = campaign.conversions > 0 ? campaign.spent / campaign.conversions : 0;

    return NextResponse.json({ 
      message: 'Campaign created successfully',
      campaign: {
        ...campaign,
        metrics: {
          ctr: Number(ctr.toFixed(2)),
          conversionRate: Number(conversionRate.toFixed(2)),
          roas: Number(roas.toFixed(2)),
          cpa: Number(cpa.toFixed(2))
        }
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
