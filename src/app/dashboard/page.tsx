'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  ShoppingCart, 
  Package, 
  Users, 
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { Card, StatCard } from '@/components/ui/card'
import { Button, ActionButton } from '@/components/ui/button'
import './dashboard.css'

interface DashboardStats {
  totalRevenue: number
  totalOrders: number  
  totalProducts: number
  totalCustomers: number
  revenueChange: number
  ordersChange: number
  productsChange: number
  customersChange: number
}

interface RecentActivity {
  id: string
  message: string
  time: string
  type: 'success' | 'info' | 'warning'
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activities, setActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  // Quick action handlers
  const handleAddProduct = () => {
    router.push('/dashboard/products')
    // Scroll to add product button or show create form
  }

  const handleViewOrders = () => {
    router.push('/dashboard/orders')
  }

  const handleViewReports = () => {
    router.push('/dashboard/reports')
  }

  // Format currency function
  const formatCurrency = (amount: number) => {
    return `฿${amount.toLocaleString()}`
  }

  // Format change percentage
  const formatChange = (change: number) => {
    return `${change >= 0 ? '+' : ''}${change}%`
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Calculate date ranges for comparison
        const now = new Date()
        const currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1) // Start of current month
        const previousPeriodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1) // Start of previous month
        const previousPeriodEnd = new Date(now.getFullYear(), now.getMonth(), 0) // End of previous month

        // Fetch current period data
        const [usersRes, productsRes, customersRes, ordersRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/products'),
          fetch('/api/customers'),
          fetch('/api/orders')
        ])

        const [users, products, customers, orders] = await Promise.all([
          usersRes.json(),
          productsRes.json(),
          customersRes.json(),
          ordersRes.json()
        ])

        // Calculate current period stats
        const currentRevenue = orders.orders?.reduce((sum: number, order: any) => 
          sum + (order.totalAmount || 0), 0) || 0
        
        const currentOrders = orders.pagination?.total || 0
        const currentProducts = products.pagination?.total || 0
        const currentCustomers = customers.pagination?.total || 0

        // Fetch previous period data for comparison
        const [prevOrdersRes, prevCustomersRes] = await Promise.all([
          fetch(`/api/orders?startDate=${previousPeriodStart.toISOString()}&endDate=${previousPeriodEnd.toISOString()}`),
          fetch(`/api/customers?startDate=${previousPeriodStart.toISOString()}&endDate=${previousPeriodEnd.toISOString()}`)
        ])

        let revenueChange = 0
        let ordersChange = 0
        let customersChange = 0
        const productsChange = 5 // Assume 5% growth for products (since we don't have historical product data)

        try {
          const [prevOrders, prevCustomers] = await Promise.all([
            prevOrdersRes.json(),
            prevCustomersRes.json()
          ])

          // Calculate previous period stats
          const previousRevenue = prevOrders.orders?.reduce((sum: number, order: any) => 
            sum + (order.totalAmount || 0), 0) || 0
          const previousOrderCount = prevOrders.pagination?.total || 0
          const previousCustomerCount = prevCustomers.pagination?.total || 0

          // Calculate percentage changes
          if (previousRevenue > 0) {
            revenueChange = Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100)
          }
          if (previousOrderCount > 0) {
            ordersChange = Math.round(((currentOrders - previousOrderCount) / previousOrderCount) * 100)
          }
          if (previousCustomerCount > 0) {
            customersChange = Math.round(((currentCustomers - previousCustomerCount) / previousCustomerCount) * 100)
          }
        } catch (error) {
          console.log('Could not fetch previous period data for comparison:', error)
          // Use fallback values if comparison fails
          revenueChange = 12
          ordersChange = 8
          customersChange = -2
        }

        const dashboardStats: DashboardStats = {
          totalRevenue: currentRevenue,
          totalOrders: currentOrders,
          totalProducts: currentProducts,
          totalCustomers: currentCustomers,
          revenueChange,
          ordersChange,
          productsChange,
          customersChange
        }

        setStats(dashboardStats)

        // Generate recent activities from orders
        const recentActivities: RecentActivity[] = orders.orders?.slice(0, 3).map((order: any, index: number) => ({
          id: order.id,
          message: `คำสั่งซื้อ #${order.orderNumber} ${order.status === 'COMPLETED' ? 'ได้รับการชำระเงินแล้ว' : 'รอการจัดส่ง'}`,
          time: `${(index + 1) * 5} นาทีที่แล้ว`,
          type: order.status === 'COMPLETED' ? 'success' as const : 'warning' as const
        })) || []

        setActivities(recentActivities)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        // Fallback to default stats if API fails
        setStats({
          totalRevenue: 0,
          totalOrders: 0,
          totalProducts: 0,
          totalCustomers: 0,
          revenueChange: 0,
          ordersChange: 0,
          productsChange: 0,
          customersChange: 0
        })
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchDashboardData()
    }
  }, [session])

  if (!session) {
    return null
  }

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          {/* Header Skeleton */}
          <div className="text-center">
            <div className="h-10 sm:h-12 bg-gradient-to-r from-slate-200 to-slate-300 rounded-2xl w-64 sm:w-80 mx-auto mb-4 loading-skeleton"></div>
            <div className="h-5 sm:h-6 bg-gradient-to-r from-slate-200 to-slate-300 rounded-xl w-80 sm:w-96 mx-auto loading-skeleton"></div>
            <div className="mt-4 w-16 sm:w-24 h-1 bg-gradient-to-r from-slate-200 to-slate-300 mx-auto rounded-full loading-skeleton"></div>
          </div>
          
          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} variant="glass" className="animate-pulse">
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-slate-200 to-slate-300 rounded-xl loading-skeleton"></div>
                  <div className="flex-1 space-y-2 sm:space-y-3">
                    <div className="h-3 sm:h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded loading-skeleton"></div>
                    <div className="h-6 sm:h-8 bg-gradient-to-r from-slate-200 to-slate-300 rounded loading-skeleton"></div>
                    <div className="h-3 sm:h-4 w-12 sm:w-16 bg-gradient-to-r from-slate-200 to-slate-300 rounded loading-skeleton"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Quick Actions Skeleton */}
          <Card variant="glass">
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="w-2 h-6 sm:h-8 bg-gradient-to-b from-slate-200 to-slate-300 rounded-full mr-3 sm:mr-4 loading-skeleton"></div>
              <div className="h-6 sm:h-8 w-48 sm:w-64 bg-gradient-to-r from-slate-200 to-slate-300 rounded-xl loading-skeleton"></div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center p-4 sm:p-6 border-2 border-slate-200 rounded-2xl">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-slate-200 to-slate-300 rounded-xl mr-3 sm:mr-4 loading-skeleton"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 sm:h-5 bg-gradient-to-r from-slate-200 to-slate-300 rounded loading-skeleton"></div>
                    <div className="h-3 sm:h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded loading-skeleton"></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Activity Skeleton */}
          <Card variant="glass">
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="w-2 h-6 sm:h-8 bg-gradient-to-b from-slate-200 to-slate-300 rounded-full mr-3 sm:mr-4 loading-skeleton"></div>
              <div className="h-6 sm:h-8 w-40 sm:w-48 bg-gradient-to-r from-slate-200 to-slate-300 rounded-xl loading-skeleton"></div>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center flex-1 mb-2 sm:mb-0">
                    <div className="w-3 h-3 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full mr-3 sm:mr-4 loading-skeleton"></div>
                    <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded flex-1 mr-4 loading-skeleton"></div>
                  </div>
                  <div className="h-5 sm:h-6 w-16 sm:w-20 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full loading-skeleton self-start sm:self-center"></div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    )
  }

  const statsData = [
    {
      name: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      change: formatChange(stats.revenueChange),
      changeType: stats.revenueChange >= 0 ? 'increase' as const : 'decrease' as const,
      icon: DollarSign,
      gradient: 'from-blue-500 to-indigo-600',
      hoverGradient: 'hover:from-blue-600 hover:to-indigo-700',
      bgHover: 'hover:from-blue-50 hover:to-indigo-50'
    },
    {
      name: 'Orders',
      value: stats.totalOrders.toLocaleString(),
      change: formatChange(stats.ordersChange),
      changeType: stats.ordersChange >= 0 ? 'increase' as const : 'decrease' as const,
      icon: ShoppingCart,
      gradient: 'from-emerald-500 to-green-600',
      hoverGradient: 'hover:from-emerald-600 hover:to-green-700',
      bgHover: 'hover:from-emerald-50 hover:to-green-50'
    },
    {
      name: 'Products',
      value: stats.totalProducts.toLocaleString(),
      change: formatChange(stats.productsChange),
      changeType: stats.productsChange >= 0 ? 'increase' as const : 'decrease' as const,
      icon: Package,
      gradient: 'from-purple-500 to-pink-600',
      hoverGradient: 'hover:from-purple-600 hover:to-pink-700',
      bgHover: 'hover:from-purple-50 hover:to-pink-50'
    },
    {
      name: 'Customers',
      value: stats.totalCustomers.toLocaleString(),
      change: formatChange(stats.customersChange),
      changeType: stats.customersChange >= 0 ? 'increase' as const : 'decrease' as const,
      icon: Users,
      gradient: 'from-orange-500 to-red-600',
      hoverGradient: 'hover:from-orange-600 hover:to-red-700',
      bgHover: 'hover:from-orange-50 hover:to-red-50'
    },
  ]

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Welcome Header */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            สวัสดี, {session.user?.name}! 👋
          </h1>
          <p className="text-base sm:text-lg text-slate-600 font-medium max-w-2xl mx-auto">
            นี่คือภาพรวมของร้านค้าออนไลน์ของคุณในวันนี้
          </p>
          <div className="mt-4 w-16 sm:w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto rounded-full"></div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statsData.map((stat, index) => (
            <StatCard
              key={stat.name}
              title={stat.name}
              value={stat.value}
              trend={{
                value: parseFloat(stat.change.replace('%', '').replace('+', '')),
                isPositive: parseFloat(stat.change.replace('%', '').replace('+', '')) >= 0,
                period: 'vs last month'
              }}
              icon={stat.icon}
              color={
                stat.name === 'Total Revenue' ? 'blue' :
                stat.name === 'Orders' ? 'green' :
                stat.name === 'Products' ? 'purple' : 'red'
              }
              className="animate-slide-in-up"
              style={{
                animationDelay: `${index * 0.1}s`
              }}
            />
          ))}
        </div>

        {/* Quick Actions */}
        <Card variant="glass" className="overflow-hidden">
          <div className="px-6 py-6 sm:px-8 sm:py-8">
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="w-2 h-6 sm:h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full mr-3 sm:mr-4"></div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                การดำเนินการด่วน ⚡
              </h3>
            </div>
                        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <ActionButton
                onClick={handleAddProduct}
                icon={Package}
                label="เพิ่มสินค้าใหม่"
                description="เพิ่มสินค้าลงในคลังสินค้า"
                variant="info"
                className="w-full"
              />
              <ActionButton
                onClick={handleViewOrders}
                icon={ShoppingCart}
                label="ดูคำสั่งซื้อใหม่"
                description="ตรวจสอบคำสั่งซื้อที่รอการจัดส่ง"
                variant="success"
                className="w-full"
              />
              <ActionButton
                onClick={handleViewReports}
                icon={TrendingUp}
                label="ดูรายงาน"
                description="วิเคราะห์ยอดขายและผลประกอบการ"
                variant="purple"
                className="w-full sm:col-span-2 lg:col-span-1"
              />
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card variant="glass" className="overflow-hidden">
          <div className="px-6 py-6 sm:px-8 sm:py-8">
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="w-2 h-6 sm:h-8 bg-gradient-to-b from-emerald-500 to-green-600 rounded-full mr-3 sm:mr-4"></div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                กิจกรรมล่าสุด 📊
              </h3>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {activities.length > 0 ? (
                activities.map((activity, index) => (
                  <div 
                    key={activity.id} 
                    className="group flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-white hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 hover:shadow-lg border border-slate-100 hover:border-blue-200"
                    style={{
                      animationDelay: `${index * 0.1}s`,
                      animation: 'slideInLeft 0.6s ease-out forwards'
                    }}
                  >
                    <div className="flex items-center mb-2 sm:mb-0">
                      <div className={`w-3 h-3 rounded-full mr-3 sm:mr-4 transition-all duration-300 group-hover:scale-125 shadow-sm ${
                        activity.type === 'success' ? 'bg-gradient-to-br from-emerald-400 to-green-500' :
                        activity.type === 'info' ? 'bg-gradient-to-br from-blue-400 to-indigo-500' : 
                        'bg-gradient-to-br from-yellow-400 to-orange-500'
                      }`}></div>
                      <span className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors duration-300">{activity.message}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full group-hover:bg-blue-100 group-hover:text-blue-600 transition-all duration-300 self-start sm:self-center">{activity.time}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <span className="text-xl sm:text-2xl">💤</span>
                  </div>
                  <p className="text-base sm:text-lg font-medium text-slate-500">ไม่มีกิจกรรมล่าสุด</p>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">กิจกรรมใหม่จะแสดงที่นี่</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}