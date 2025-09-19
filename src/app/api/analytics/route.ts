import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function getOverviewAnalytics(period: string = '12months') {
  const now = new Date();
  let startDate: Date;

  // Calculate date range based on period
  switch (period) {
    case '30days':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90days':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case '12months':
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  // Get total revenue and orders
  const orderStats = await prisma.order.aggregate({
    _sum: {
      total: true
    },
    _count: true,
    where: {
      createdAt: {
        gte: startDate
      },
      status: {
        not: 'CANCELLED'
      }
    }
  });

  // Get total customers
  const totalCustomers = await prisma.customer.count({
    where: {
      createdAt: {
        gte: startDate
      }
    }
  });

  // Get new vs returning customers
  const newCustomers = await prisma.customer.count({
    where: {
      createdAt: {
        gte: startDate
      }
    }
  });

  const returningCustomers = await prisma.order.groupBy({
    by: ['customerId'],
    _count: true,
    where: {
      createdAt: {
        gte: startDate
      }
    },
    having: {
      customerId: {
        _count: {
          gt: 1
        }
      }
    }
  });

  const totalRevenue = orderStats._sum.total || 0;
  const totalOrders = orderStats._count || 0;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const conversionRate = totalCustomers > 0 ? (totalOrders / totalCustomers) * 100 : 0;

  return {
    totalRevenue: Number(totalRevenue),
    totalOrders,
    totalCustomers,
    conversionRate: Number(conversionRate.toFixed(2)),
    averageOrderValue: Number(averageOrderValue.toFixed(2)),
    returningCustomers: returningCustomers.length,
    newCustomers: newCustomers - returningCustomers.length,
    revenueGrowth: 12.5, // TODO: Calculate actual growth
    orderGrowth: 8.3, // TODO: Calculate actual growth
    customerGrowth: 15.2 // TODO: Calculate actual growth
  };
}

async function getSalesChart(period: string = '12months') {
  const now = new Date();
  const months = [];
  const salesData = [];
  const ordersData = [];

  // Generate last 12 months
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    
    months.push(date.toLocaleDateString('th-TH', { month: 'short' }));

    const monthStats = await prisma.order.aggregate({
      _sum: {
        total: true
      },
      _count: true,
      where: {
        createdAt: {
          gte: date,
          lt: nextDate
        },
        status: {
          not: 'CANCELLED'
        }
      }
    });

    salesData.push(Number(monthStats._sum.total || 0));
    ordersData.push(monthStats._count || 0);
  }

  return {
    labels: months,
    data: salesData,
    orders: ordersData
  };
}

async function getTopProducts(limit: number = 5) {
  const topProducts = await prisma.orderItem.groupBy({
    by: ['productId'],
    _sum: {
      quantity: true,
      subtotal: true
    },
    orderBy: {
      _sum: {
        subtotal: 'desc'
      }
    },
    take: limit
  });

  const productsWithDetails = await Promise.all(
    topProducts.map(async (item) => {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: {
          category: true
        }
      });

      return {
        id: item.productId,
        name: product?.name || 'Unknown Product',
        category: product?.category?.name || 'Unknown Category',
        revenue: Number(item._sum.subtotal || 0),
        units: Number(item._sum.quantity || 0),
        growth: 15.5 // TODO: Calculate actual growth
      };
    })
  );

  return productsWithDetails;
}

async function getTopCategories() {
  const categoryStats = await prisma.orderItem.groupBy({
    by: ['productId'],
    _sum: {
      subtotal: true
    }
  });

  const categoryRevenue = new Map();
  let totalRevenue = 0;

  for (const item of categoryStats) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
      include: { category: true }
    });

    const categoryName = product?.category?.name || 'Unknown';
    const revenue = Number(item._sum.subtotal || 0);
    
    categoryRevenue.set(categoryName, (categoryRevenue.get(categoryName) || 0) + revenue);
    totalRevenue += revenue;
  }

  const topCategories = Array.from(categoryRevenue.entries())
    .map(([name, revenue]) => ({
      name,
      revenue,
      percentage: Number(((revenue / totalRevenue) * 100).toFixed(1))
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  return topCategories;
}

async function getCustomerSegments() {
  // Simple customer segmentation based on order count
  const customerOrders = await prisma.order.groupBy({
    by: ['customerId'],
    _count: true,
    _sum: {
      total: true
    }
  });

  const vipCustomers = customerOrders.filter(c => c._count >= 5);
  const regularCustomers = customerOrders.filter(c => c._count >= 2 && c._count < 5);
  const newCustomers = customerOrders.filter(c => c._count === 1);

  return [
    {
      segment: 'ลูกค้า VIP',
      count: vipCustomers.length,
      revenue: vipCustomers.reduce((sum, c) => sum + Number(c._sum.total || 0), 0),
      percentage: 40.0 // TODO: Calculate actual percentage
    },
    {
      segment: 'ลูกค้าประจำ',
      count: regularCustomers.length,
      revenue: regularCustomers.reduce((sum, c) => sum + Number(c._sum.total || 0), 0),
      percentage: 34.7 // TODO: Calculate actual percentage
    },
    {
      segment: 'ลูกค้าใหม่',
      count: newCustomers.length,
      revenue: newCustomers.reduce((sum, c) => sum + Number(c._sum.total || 0), 0),
      percentage: 25.3 // TODO: Calculate actual percentage
    }
  ];
}

async function getInventoryStats() {
  const totalProducts = await prisma.product.count();
  
  const lowStock = await prisma.product.count({
    where: {
      stock: {
        lte: 10,
        gt: 0
      }
    }
  });

  const outOfStock = await prisma.product.count({
    where: {
      stock: {
        lte: 0
      }
    }
  });

  const totalValue = await prisma.product.aggregate({
    _sum: {
      price: true
    }
  });

  return {
    totalProducts,
    lowStock,
    outOfStock,
    overstocked: 12, // TODO: Define overstocked logic
    totalValue: Number(totalValue._sum.price || 0),
    categories: [] // TODO: Calculate category breakdown
  };
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview';
    const period = searchParams.get('period') || '12months';

    // Return different data based on type
    switch (type) {
      case 'overview':
        const overview = await getOverviewAnalytics(period);
        const salesChart = await getSalesChart(period);
        return NextResponse.json({
          overview,
          salesChart
        });
      
      case 'products':
        const topProducts = await getTopProducts();
        const topCategories = await getTopCategories();
        return NextResponse.json({
          topProducts,
          topCategories
        });
      
      case 'customers':
        const customerSegments = await getCustomerSegments();
        const customerOverview = await getOverviewAnalytics(period);
        return NextResponse.json({
          customerSegments,
          overview: {
            totalCustomers: customerOverview.totalCustomers,
            newCustomers: customerOverview.newCustomers,
            returningCustomers: customerOverview.returningCustomers,
            customerGrowth: customerOverview.customerGrowth
          }
        });
      
      case 'traffic':
        // Traffic analytics would need external analytics service integration
        return NextResponse.json({
          traffic: {
            totalVisitors: 0,
            uniqueVisitors: 0,
            pageViews: 0,
            bounceRate: 0,
            avgSessionDuration: '0:00',
            sources: []
          }
        });
      
      case 'inventory':
        const inventory = await getInventoryStats();
        return NextResponse.json({
          inventory
        });
      
      default:
        const allOverview = await getOverviewAnalytics(period);
        const allSalesChart = await getSalesChart(period);
        const allTopProducts = await getTopProducts();
        const allTopCategories = await getTopCategories();
        const allCustomerSegments = await getCustomerSegments();
        const allInventory = await getInventoryStats();
        
        return NextResponse.json({
          overview: allOverview,
          salesChart: allSalesChart,
          topProducts: allTopProducts,
          topCategories: allTopCategories,
          customerSegments: allCustomerSegments,
          inventory: allInventory
        });
    }

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
