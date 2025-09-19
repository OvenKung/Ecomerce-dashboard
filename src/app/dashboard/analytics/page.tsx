'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useToastNotification } from '@/hooks/use-toast-notification'

interface AnalyticsOverview {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  conversionRate: number
  averageOrderValue: number
  returningCustomers: number
  newCustomers: number
  revenueGrowth: number
  orderGrowth: number
  customerGrowth: number
}

interface SalesChart {
  labels: string[]
  data: number[]
  orders: number[]
}

interface TopProduct {
  id: string
  name: string
  category: string
  revenue: number
  units: number
  growth: number
}

interface TopCategory {
  name: string
  revenue: number
  percentage: number
}

interface CustomerSegment {
  segment: string
  count: number
  revenue: number
  percentage: number
}

interface TrafficSource {
  source: string
  visitors: number
  percentage: number
}

interface Traffic {
  totalVisitors: number
  uniqueVisitors: number
  pageViews: number
  bounceRate: number
  avgSessionDuration: string
  sources: TrafficSource[]
}

interface InventoryCategory {
  name: string
  products: number
  value: number
}

interface Inventory {
  totalProducts: number
  lowStock: number
  outOfStock: number
  overstocked: number
  totalValue: number
  categories: InventoryCategory[]
}

export default function AnalyticsPage() {
  const { data: session } = useSession()
  const toast = useToastNotification()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  
  // Data states
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null)
  const [salesChart, setSalesChart] = useState<SalesChart | null>(null)
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [topCategories, setTopCategories] = useState<TopCategory[]>([])
  const [customerSegments, setCustomerSegments] = useState<CustomerSegment[]>([])
  const [traffic, setTraffic] = useState<Traffic | null>(null)
  const [inventory, setInventory] = useState<Inventory | null>(null)

  const fetchAnalytics = async (type: string = 'overview') => {
    try {
      setLoading(true)
      const response = await fetch(`/api/analytics?type=${type}`)
      const data = await response.json()

      if (response.ok) {
        switch (type) {
          case 'overview':
            setOverview(data.overview)
            setSalesChart(data.salesChart)
            break
          case 'products':
            setTopProducts(data.topProducts)
            setTopCategories(data.topCategories)
            break
          case 'customers':
            setCustomerSegments(data.customerSegments)
            break
          case 'traffic':
            setTraffic(data.traffic)
            break
          case 'inventory':
            setInventory(data.inventory)
            break
        }
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast.showError('เกิดข้อผิดพลาดในการโหลดข้อมูลวิเคราะห์')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchAnalytics(activeTab)
    }
  }, [session, activeTab])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('th-TH').format(num)
  }

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`
  }

  if (!session) {
    return <div>กำลังโหลด...</div>
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">วิเคราะห์และรายงาน</h1>
        <p className="text-gray-600">ดูสถิติและวิเคราะห์ข้อมูลการขายและลูกค้า</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'ภาพรวม' },
            { id: 'products', name: 'สินค้า' },
            { id: 'customers', name: 'ลูกค้า' },
            { id: 'traffic', name: 'ทราฟฟิก' },
            { id: 'inventory', name: 'คลังสินค้า' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {loading ? (
        <div className="text-center py-8">กำลังโหลด...</div>
      ) : (
        <>
          {/* Overview Tab */}
          {activeTab === 'overview' && overview && salesChart && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-sm font-medium text-gray-500">ยอดขายรวม</h3>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(overview.totalRevenue)}</p>
                  <div className="flex items-center mt-2">
                    <span className={`text-sm ${overview.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {overview.revenueGrowth >= 0 ? '↗' : '↘'} {formatPercentage(Math.abs(overview.revenueGrowth))}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">จากเดือนที่แล้ว</span>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-sm font-medium text-gray-500">คำสั่งซื้อ</h3>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(overview.totalOrders)}</p>
                  <div className="flex items-center mt-2">
                    <span className={`text-sm ${overview.orderGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {overview.orderGrowth >= 0 ? '↗' : '↘'} {formatPercentage(Math.abs(overview.orderGrowth))}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">จากเดือนที่แล้ว</span>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-sm font-medium text-gray-500">ลูกค้า</h3>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(overview.totalCustomers)}</p>
                  <div className="flex items-center mt-2">
                    <span className={`text-sm ${overview.customerGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {overview.customerGrowth >= 0 ? '↗' : '↘'} {formatPercentage(Math.abs(overview.customerGrowth))}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">จากเดือนที่แล้ว</span>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-sm font-medium text-gray-500">ยอดเฉลี่ย/คำสั่ง</h3>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(overview.averageOrderValue)}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-gray-500">
                      อัตราแปลง {formatPercentage(overview.conversionRate)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">ลูกค้าใหม่ vs ลูกค้าเก่า</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">ลูกค้าใหม่</span>
                      <span className="font-medium">{formatNumber(overview.newCustomers)} คน</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">ลูกค้าเก่า</span>
                      <span className="font-medium">{formatNumber(overview.returningCustomers)} คน</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${(overview.returningCustomers / overview.totalCustomers) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-500 text-center">
                      {formatPercentage((overview.returningCustomers / overview.totalCustomers) * 100)} ลูกค้าเก่า
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">ยอดขายรายเดือน</h3>
                  <div className="h-64">
                    <div className="flex items-end justify-between h-48 space-x-1">
                      {salesChart.data.slice(-6).map((value, index) => {
                        const maxValue = Math.max(...salesChart.data)
                        const height = (value / maxValue) * 100
                        return (
                          <div key={index} className="flex flex-col items-center">
                            <div 
                              className="bg-blue-500 rounded-t w-8"
                              style={{ height: `${height}%` }}
                              title={formatCurrency(value)}
                            ></div>
                            <span className="text-xs text-gray-500 mt-1">
                              {salesChart.labels.slice(-6)[index]}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Products */}
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">สินค้าขายดี</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {topProducts.map((product, index) => (
                        <div key={product.id} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="text-lg font-bold text-gray-400 w-6">
                              {index + 1}
                            </span>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">{product.name}</p>
                              <p className="text-sm text-gray-500">{product.category}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {formatCurrency(product.revenue)}
                            </p>
                            <p className="text-sm text-gray-500">{product.units} ชิ้น</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Top Categories */}
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">หมวดหมู่ขายดี</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {topCategories.map((category, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-900">{category.name}</span>
                            <span className="text-sm text-gray-500">
                              {formatCurrency(category.revenue)} ({formatPercentage(category.percentage)})
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${category.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Customers Tab */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">กลุ่มลูกค้า</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {customerSegments.map((segment, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-900">{segment.segment}</span>
                          <span className="text-sm text-gray-500">
                            {formatNumber(segment.count)} คน • {formatCurrency(segment.revenue)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-green-600 h-3 rounded-full" 
                            style={{ width: `${segment.percentage}%` }}
                          ></div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatPercentage(segment.percentage)} ของยอดขายรวม
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Traffic Tab */}
          {activeTab === 'traffic' && traffic && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-sm font-medium text-gray-500">ผู้เยียมชมทั้งหมด</h3>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(traffic.totalVisitors)}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-sm font-medium text-gray-500">ผู้เยียมชมไม่ซ้ำ</h3>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(traffic.uniqueVisitors)}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-sm font-medium text-gray-500">การดูหน้า</h3>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(traffic.pageViews)}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-sm font-medium text-gray-500">อัตราตีกลับ</h3>
                  <p className="text-2xl font-bold text-gray-900">{formatPercentage(traffic.bounceRate)}</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">แหล่งที่มาของทราฟฟิก</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {traffic.sources.map((source, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-900">{source.source}</span>
                          <span className="text-sm text-gray-500">
                            {formatNumber(source.visitors)} ({formatPercentage(source.percentage)})
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full" 
                            style={{ width: `${source.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Inventory Tab */}
          {activeTab === 'inventory' && inventory && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-sm font-medium text-gray-500">สินค้าทั้งหมด</h3>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(inventory.totalProducts)}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-sm font-medium text-gray-500">สต็อกต่ำ</h3>
                  <p className="text-2xl font-bold text-yellow-600">{formatNumber(inventory.lowStock)}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-sm font-medium text-gray-500">สินค้าหมด</h3>
                  <p className="text-2xl font-bold text-red-600">{formatNumber(inventory.outOfStock)}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-sm font-medium text-gray-500">มูลค่าคลัง</h3>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(inventory.totalValue)}</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">มูลค่าคลังสินค้าตามหมวดหมู่</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {inventory.categories.map((category, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{category.name}</p>
                          <p className="text-sm text-gray-500">{category.products} รายการ</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {formatCurrency(category.value)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatPercentage((category.value / inventory.totalValue) * 100)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}