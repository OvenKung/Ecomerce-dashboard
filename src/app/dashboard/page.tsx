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
        // Fetch stats from real APIs
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

        // Calculate stats from real data
        const totalRevenue = orders.orders?.reduce((sum: number, order: any) => 
          sum + (order.totalAmount || 0), 0) || 0
        
        const dashboardStats: DashboardStats = {
          totalRevenue,
          totalOrders: orders.pagination?.total || 0,
          totalProducts: products.pagination?.total || 0,
          totalCustomers: customers.pagination?.total || 0,
          revenueChange: 12, // TODO: Calculate from previous period
          ordersChange: 8,
          productsChange: 4,
          customersChange: -2
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
              <div key={i} className="group bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/50">
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-slate-200 to-slate-300 rounded-xl loading-skeleton"></div>
                  <div className="flex-1 space-y-2 sm:space-y-3">
                    <div className="h-3 sm:h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded loading-skeleton"></div>
                    <div className="h-6 sm:h-8 bg-gradient-to-r from-slate-200 to-slate-300 rounded loading-skeleton"></div>
                    <div className="h-3 sm:h-4 w-12 sm:w-16 bg-gradient-to-r from-slate-200 to-slate-300 rounded loading-skeleton"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions Skeleton */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-xl border border-white/50">
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
          </div>

          {/* Recent Activity Skeleton */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-xl border border-white/50">
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
          </div>
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
            <div
              key={stat.name}
              className={`group relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-sm px-4 py-6 sm:px-6 sm:py-8 shadow-lg hover:shadow-2xl transition-all duration-500 ease-out hover:scale-105 hover:bg-white/90 border border-white/50 cursor-pointer ${stat.bgHover}`}
              style={{
                animationDelay: `${index * 0.1}s`,
                animation: 'slideInUp 0.6s ease-out forwards'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <dt className="relative">
                <div className={`absolute rounded-xl bg-gradient-to-br ${stat.gradient} ${stat.hoverGradient} p-2 sm:p-3 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                  <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" aria-hidden="true" />
                </div>
                <p className="ml-12 sm:ml-16 truncate text-xs sm:text-sm font-semibold text-slate-600 group-hover:text-slate-700 transition-colors duration-300">
                  {stat.name}
                </p>
              </dt>
              <dd className="ml-12 sm:ml-16 flex items-baseline mt-1 sm:mt-2">
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-300">{stat.value}</p>
                <p
                  className={`ml-2 sm:ml-3 flex items-center text-xs sm:text-sm font-bold transition-all duration-300 group-hover:scale-110 ${
                    stat.changeType === 'increase'
                      ? 'text-emerald-600'
                      : 'text-rose-600'
                  }`}
                >
                  {stat.changeType === 'increase' ? (
                    <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 self-center mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 self-center mr-1" />
                  )}
                  <span className="sr-only">
                    {stat.changeType === 'increase' ? 'Increased' : 'Decreased'} by
                  </span>
                  {stat.change}
                </p>
              </dd>
              <div className="absolute bottom-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-tl from-slate-100/50 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white/70 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50 overflow-hidden">
          <div className="px-6 py-6 sm:px-8 sm:py-8">
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="w-2 h-6 sm:h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full mr-3 sm:mr-4"></div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                การดำเนินการด่วน ⚡
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <button 
                onClick={handleAddProduct}
                className="group flex items-center p-4 sm:p-6 border-2 border-slate-200 rounded-2xl hover:border-blue-300 transition-all duration-300 hover:scale-105 hover:shadow-lg bg-gradient-to-br from-white to-slate-50 hover:from-blue-50 hover:to-indigo-50"
              >
                <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3 sm:mr-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Package className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-900 text-base sm:text-lg group-hover:text-blue-600 transition-colors duration-300">เพิ่มสินค้าใหม่</p>
                  <p className="text-xs sm:text-sm text-slate-600 group-hover:text-slate-700 transition-colors duration-300">เพิ่มสินค้าลงในคลังสินค้า</p>
                </div>
              </button>
              <button 
                onClick={handleViewOrders}
                className="group flex items-center p-4 sm:p-6 border-2 border-slate-200 rounded-2xl hover:border-emerald-300 transition-all duration-300 hover:scale-105 hover:shadow-lg bg-gradient-to-br from-white to-slate-50 hover:from-emerald-50 hover:to-green-50"
              >
                <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center mr-3 sm:mr-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <ShoppingCart className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-900 text-base sm:text-lg group-hover:text-emerald-600 transition-colors duration-300">ดูคำสั่งซื้อใหม่</p>
                  <p className="text-xs sm:text-sm text-slate-600 group-hover:text-slate-700 transition-colors duration-300">ตรวจสอบคำสั่งซื้อที่รอการจัดส่ง</p>
                </div>
              </button>
              <button 
                onClick={handleViewReports}
                className="group flex items-center p-4 sm:p-6 border-2 border-slate-200 rounded-2xl hover:border-purple-300 transition-all duration-300 hover:scale-105 hover:shadow-lg bg-gradient-to-br from-white to-slate-50 hover:from-purple-50 hover:to-pink-50 sm:col-span-2 lg:col-span-1"
              >
                <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-3 sm:mr-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-900 text-base sm:text-lg group-hover:text-purple-600 transition-colors duration-300">ดูรายงาน</p>
                  <p className="text-xs sm:text-sm text-slate-600 group-hover:text-slate-700 transition-colors duration-300">วิเคราะห์ยอดขายและผลประกอบการ</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/70 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50 overflow-hidden">
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
        </div>
      </div>
    </div>
  )
}