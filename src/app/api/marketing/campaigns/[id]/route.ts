import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id }
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Calculate metrics
    const metrics = {
      ctr: campaign.impressions > 0 ? Number(((campaign.clicks / campaign.impressions) * 100).toFixed(2)) : 0,
      conversionRate: campaign.clicks > 0 ? Number(((campaign.conversions / campaign.clicks) * 100).toFixed(2)) : 0,
      roas: Number(campaign.spent) > 0 ? Number((Number(campaign.revenue) / Number(campaign.spent)).toFixed(2)) : 0,
      cpa: campaign.conversions > 0 ? Number((Number(campaign.spent) / campaign.conversions).toFixed(2)) : 0
    }

    return NextResponse.json({
      campaign: {
        ...campaign,
        metrics
      }
    })

  } catch (error) {
    console.error('Error fetching campaign:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if campaign exists
    const existingCampaign = await prisma.campaign.findUnique({
      where: { id: params.id }
    })

    if (!existingCampaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Check if campaign is active
    if (existingCampaign.status === 'ACTIVE') {
      // Mark as cancelled instead of deleting
      await prisma.campaign.update({
        where: { id: params.id },
        data: { status: 'CANCELLED' }
      })

      return NextResponse.json({
        message: 'Active campaign cancelled successfully'
      })
    } else {
      // Safe to delete if not active
      await prisma.campaign.delete({
        where: { id: params.id }
      })

      return NextResponse.json({
        message: 'Campaign deleted successfully'
      })
    }

  } catch (error) {
    console.error('Error deleting campaign:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}