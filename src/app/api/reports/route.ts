import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Helper function to calculate RFM score
function calculateRFMScore(recency: number, frequency: number, monetary: number): string {
  // RFM scoring logic (simplified)
  const rScore = recency <= 30 ? 5 : recency <= 60 ? 4 : recency <= 90 ? 3 : recency <= 180 ? 2 : 1
  const fScore = frequency >= 10 ? 5 : frequency >= 7 ? 4 : frequency >= 5 ? 3 : frequency >= 3 ? 2 : 1
  const mScore = monetary >= 100000 ? 5 : monetary >= 50000 ? 4 : monetary >= 25000 ? 3 : monetary >= 10000 ? 2 : 1
  
  const totalScore = rScore + fScore + mScore
  
  if (totalScore >= 13) return 'Champion'
  if (totalScore >= 11) return 'Loyal Customer'
  if (totalScore >= 9) return 'Potential Loyalist'
  if (totalScore >= 7) return 'At Risk'
  if (totalScore >= 5) return 'Cannot Lose Them'
  return 'Lost Customer'
}

// Helper function to determine customer segment
function getCustomerSegment(totalSpent: number, orderCount: number): string {
  if (totalSpent >= 200000 && orderCount >= 10) return 'VIP'
  if (totalSpent >= 100000 || orderCount >= 5) return 'Regular'
  if (orderCount <= 2) return 'New'
  return 'At Risk'
}

const generateSalesReport = async (startDate: Date, endDate: Date) => {
  // Get daily sales data from database
  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      },
      status: {
        in: ['COMPLETED']
      }
    },
    include: {
      orderItems: true,
      customer: true
    }
  })

  // Group orders by date
  const dailyData: any = {}
  
  orders.forEach(order => {
    const date = order.createdAt.toISOString().split('T')[0]
    
    if (!dailyData[date]) {
      dailyData[date] = {
        date,
        revenue: 0,
        orders: 0,
        customers: new Set(),
        orderValues: []
      }
    }
    
    dailyData[date].revenue += order.total
    dailyData[date].orders += 1
    dailyData[date].customers.add(order.customerId)
    dailyData[date].orderValues.push(order.total)
  })

  // Convert to array and calculate metrics
  const data = Object.values(dailyData).map((day: any) => ({
    date: day.date,
    revenue: day.revenue,
    orders: day.orders,
    customers: day.customers.size,
    averageOrderValue: day.orders > 0 ? Math.floor(day.revenue / day.orders) : 0,
    conversionRate: (Math.random() * 5 + 2).toFixed(2) // Mock conversion rate as it requires visitor tracking
  }))

  // Calculate summary
  const summary = {
    totalRevenue: data.reduce((sum, d) => sum + d.revenue, 0),
    totalOrders: data.reduce((sum, d) => sum + d.orders, 0),
    totalCustomers: data.reduce((sum, d) => sum + d.customers, 0),
    averageOrderValue: data.length > 0 ? data.reduce((sum, d) => sum + d.averageOrderValue, 0) / data.length : 0,
    averageConversionRate: data.length > 0 ? data.reduce((sum, d) => sum + parseFloat(d.conversionRate), 0) / data.length : 0
  }

  return { data, summary }
}

const generateInventoryReport = async () => {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      brand: true,
      inventoryLogs: {
        orderBy: {
          createdAt: 'desc'
        },
        take: 1
      },
      orderItems: {
        where: {
          order: {
            createdAt: {
              gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // Last year
            }
          }
        }
      }
    }
  })

  const inventoryData = products.map(product => {
    const totalSold = product.orderItems.reduce((sum, item) => sum + item.quantity, 0)
    const turnoverRate = product.stock > 0 ? (totalSold / product.stock) * 12 : 0 // Annualized
    const daysOnHand = turnoverRate > 0 ? Math.floor(365 / turnoverRate) : 0
    
    let status = 'IN_STOCK'
    if (product.stock === 0) status = 'OUT_OF_STOCK'
    else if (product.stock <= (product.reorderLevel || 10)) status = 'LOW_STOCK'
    
    return {
      id: product.id,
      productName: product.name,
      sku: product.sku,
      category: product.category?.name || 'Uncategorized',
      brand: product.brand?.name || 'No Brand',
      currentStock: product.stock,
      reservedStock: Math.floor(product.stock * 0.1), // Mock reserved stock
      availableStock: Math.floor(product.stock * 0.9),
      reorderLevel: product.reorderLevel || 10,
      status,
      cost: product.price * 0.7, // Estimate cost as 70% of selling price
      value: product.stock * product.price,
      turnoverRate: Number(turnoverRate.toFixed(1)),
      daysOnHand
    }
  })

  return inventoryData
}

const generateCustomerReport = async () => {
  const customers = await prisma.customer.findMany({
    include: {
      orders: {
        where: {
          status: {
            in: ['COMPLETED', 'DELIVERED']
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  })

  const customerData = customers.map(customer => {
    const totalSpent = customer.orders.reduce((sum, order) => sum + order.total, 0)
    const totalOrders = customer.orders.length
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0
    
    const lastOrder = customer.orders[0]
    const lastOrderDate = lastOrder ? lastOrder.createdAt : customer.createdAt
    const daysSinceLastOrder = Math.floor((Date.now() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24))
    const daysSinceRegistration = Math.floor((Date.now() - customer.createdAt.getTime()) / (1000 * 60 * 60 * 24))
    
    const rfmScore = calculateRFMScore(daysSinceLastOrder, totalOrders, totalSpent)
    const segment = getCustomerSegment(totalSpent, totalOrders)
    
    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      segment,
      registrationDate: customer.createdAt.toISOString().split('T')[0],
      lastOrderDate: lastOrderDate.toISOString().split('T')[0],
      totalOrders,
      totalSpent: Math.floor(totalSpent),
      averageOrderValue: Math.floor(averageOrderValue),
      lifetime: daysSinceRegistration,
      rfmScore,
      status: daysSinceLastOrder <= 90 ? 'ACTIVE' : 'INACTIVE'
    }
  })

  return customerData
}

const generateProductPerformanceReport = async () => {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      brand: true,
      orderItems: {
        include: {
          order: {
            where: {
              status: {
                in: ['COMPLETED', 'DELIVERED']
              }
            }
          }
        }
      },
      reviews: true
    }
  })

  const performanceData = products
    .filter(product => product.orderItems.length > 0)
    .map(product => {
      const unitsSold = product.orderItems.reduce((sum, item) => sum + item.quantity, 0)
      const revenue = product.orderItems.reduce((sum, item) => sum + (item.quantity * item.price), 0)
      const grossProfit = revenue * 0.3 // Estimate 30% margin
      const marginPercent = 30
      
      // Mock some metrics that would require additional tracking
      const views = unitsSold * (Math.random() * 20 + 30) // Estimate views
      const conversionRate = Number(((unitsSold / views) * 100).toFixed(1))
      
      const averageRating = product.reviews.length > 0 
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0
      
      return {
        id: product.id,
        productName: product.name,
        category: product.category?.name || 'Uncategorized',
        brand: product.brand?.name || 'No Brand',
        unitsSold,
        revenue: Math.floor(revenue),
        grossProfit: Math.floor(grossProfit),
        marginPercent,
        views: Math.floor(views),
        conversions: unitsSold,
        conversionRate,
        averageRating: Number(averageRating.toFixed(1)),
        reviewCount: product.reviews.length,
        returnRate: Number((Math.random() * 2).toFixed(1)) // Mock return rate
      }
    })
    .sort((a, b) => b.revenue - a.revenue)

  return performanceData
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type') || 'sales'
    const startDate = searchParams.get('startDate') 
    const endDate = searchParams.get('endDate')
    const format = searchParams.get('format') || 'json'

    let reportData: any = {}

    switch (reportType) {
      case 'sales':
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        const end = endDate ? new Date(endDate) : new Date()
        reportData = await generateSalesReport(start, end)
        break

      case 'inventory':
        const inventoryData = await generateInventoryReport()
        reportData = {
          data: inventoryData,
          summary: {
            totalProducts: inventoryData.length,
            inStock: inventoryData.filter(p => p.status === 'IN_STOCK').length,
            lowStock: inventoryData.filter(p => p.status === 'LOW_STOCK').length,
            outOfStock: inventoryData.filter(p => p.status === 'OUT_OF_STOCK').length,
            totalValue: inventoryData.reduce((sum, p) => sum + p.value, 0),
            averageTurnover: inventoryData.length > 0 
              ? inventoryData.reduce((sum, p) => sum + p.turnoverRate, 0) / inventoryData.length 
              : 0
          }
        }
        break

      case 'customers':
        const customerData = await generateCustomerReport()
        reportData = {
          data: customerData,
          summary: {
            totalCustomers: customerData.length,
            activeCustomers: customerData.filter(c => c.status === 'ACTIVE').length,
            inactiveCustomers: customerData.filter(c => c.status === 'INACTIVE').length,
            vipCustomers: customerData.filter(c => c.segment === 'VIP').length,
            averageLifetimeValue: customerData.length > 0 
              ? Math.floor(customerData.reduce((sum, c) => sum + c.totalSpent, 0) / customerData.length)
              : 0,
            averageOrderValue: customerData.length > 0 
              ? Math.floor(customerData.reduce((sum, c) => sum + c.averageOrderValue, 0) / customerData.length)
              : 0
          }
        }
        break

      case 'products':
        const productData = await generateProductPerformanceReport()
        reportData = {
          data: productData,
          summary: {
            totalProducts: productData.length,
            totalUnitsSold: productData.reduce((sum, p) => sum + p.unitsSold, 0),
            totalRevenue: productData.reduce((sum, p) => sum + p.revenue, 0),
            totalProfit: productData.reduce((sum, p) => sum + p.grossProfit, 0),
            averageMargin: productData.length > 0 
              ? productData.reduce((sum, p) => sum + p.marginPercent, 0) / productData.length
              : 0,
            averageConversionRate: productData.length > 0 
              ? productData.reduce((sum, p) => sum + p.conversionRate, 0) / productData.length
              : 0
          }
        }
        break

      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
    }

    // If CSV format is requested, convert data to CSV
    if (format === 'csv') {
      const csv = convertToCSV(reportData.data, reportType)
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${reportType}_report_${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }

    return NextResponse.json({
      type: reportType,
      data: reportData,
      generatedAt: new Date().toISOString(),
      parameters: {
        startDate: startDate || null,
        endDate: endDate || null,
        format
      }
    })

  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function convertToCSV(data: any[], reportType: string): string {
  if (!data || data.length === 0) return ''

  // Get headers from the first object
  const headers = Object.keys(data[0])
  
  // Create CSV content
  const csvHeaders = headers.join(',')
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header]
      // Handle values that might contain commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    }).join(',')
  )

  return [csvHeaders, ...csvRows].join('\n')
}
