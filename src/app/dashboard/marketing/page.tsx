'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Button, IconButton } from '@/components/ui/button'
import { Card, StatCard } from '@/components/ui/card'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer 
} from 'recharts'
import { 
  TrendingUp, 
  Users, 
  Mail, 
  Target, 
  Gift, 
  BarChart3, 
  Plus, 
  Play, 
  Pause, 
  Edit, 
  Trash2,
  Eye,
  DollarSign
} from 'lucide-react'

export default function MarketingPage() {
  const { data: session } = useSession()
  const [marketingStats] = useState({
    activeCampaigns: 3,
    activeCoupons: 8,
    totalReach: 45000,
    conversionRate: 5.2,
    averageROAS: 4.1,
    emailSubscribers: 12500
  })

  if (!session) {
    return <div>กำลังโหลด...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="relative p-4 space-y-6">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl"></div>
          <div className="absolute top-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 right-20 w-60 h-60 bg-gradient-to-br from-green-400/20 to-emerald-600/20 rounded-full blur-3xl"></div>
        </div>

        {/* Header */}
        <div className="relative">
          <Card variant="glass" className="border-white/20 backdrop-blur-sm bg-gradient-to-r from-white/40 to-blue-50/60">
            <div className="p-6">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent">
                การตลาดและโปรโมชั่น
              </h1>
            </div>
          </Card>
        </div>

        {/* Marketing Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 relative">
          <StatCard
            title="แคมเปญทำงาน"
            value={marketingStats.activeCampaigns}
            icon={Target}
            trend={{ value: 12, isPositive: true, period: 'month' }}
            className="border-white/20 backdrop-blur-sm bg-gradient-to-br from-green-50/80 to-emerald-50/80 animate-slide-in-up"
            style={{ animationDelay: '0.1s' }}
          />
          <StatCard
            title="คูปองทำงาน"
            value={marketingStats.activeCoupons}
            icon={Gift}
            trend={{ value: 8, isPositive: true, period: 'week' }}
            className="border-white/20 backdrop-blur-sm bg-gradient-to-br from-blue-50/80 to-cyan-50/80 animate-slide-in-up"
            style={{ animationDelay: '0.2s' }}
          />
          <StatCard
            title="การเข้าถึง"
            value={marketingStats.totalReach}
            icon={Users}
            trend={{ value: 15, isPositive: true, period: 'month' }}
            className="border-white/20 backdrop-blur-sm bg-gradient-to-br from-purple-50/80 to-pink-50/80 animate-slide-in-up"
            style={{ animationDelay: '0.3s' }}
          />
          <StatCard
            title="อัตราแปลง"
            value={`${marketingStats.conversionRate}%`}
            icon={TrendingUp}
            trend={{ value: 0.8, isPositive: true, period: 'month' }}
            className="border-white/20 backdrop-blur-sm bg-gradient-to-br from-orange-50/80 to-red-50/80 animate-slide-in-up"
            style={{ animationDelay: '0.4s' }}
          />
          <StatCard
            title="ROAS เฉลี่ย"
            value={`${marketingStats.averageROAS}x`}
            icon={DollarSign}
            trend={{ value: 0.3, isPositive: true, period: 'quarter' }}
            className="border-white/20 backdrop-blur-sm bg-gradient-to-br from-indigo-50/80 to-blue-50/80 animate-slide-in-up"
            style={{ animationDelay: '0.5s' }}
          />
          <StatCard
            title="Email Subscribers"
            value={marketingStats.emailSubscribers}
            icon={Mail}
            trend={{ value: 250, isPositive: true, period: 'month' }}
            className="border-white/20 backdrop-blur-sm bg-gradient-to-br from-teal-50/80 to-green-50/80 animate-slide-in-up"
            style={{ animationDelay: '0.6s' }}
          />
        </div>

        {/* Marketing Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
          
          {/* Campaigns */}
          <Card 
            variant="glass" 
            className="border-white/20 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-105 animate-slide-in-up"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent">
                      แคมเปญการตลาด
                    </h3>
                    <p className="text-sm text-gray-600">จัดการและติดตามแคมเปญ</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Link href="/dashboard/marketing/campaigns">
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl px-4 py-3 font-medium transition-all duration-300"
                  >
                    จัดการแคมเปญ
                  </Button>
                </Link>
                <Link href="/dashboard/marketing/campaigns/create">
                  <Button 
                    className="w-full bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200 text-slate-700 hover:from-slate-100 hover:to-gray-100 hover:border-slate-300 rounded-xl px-4 py-3 font-medium transition-all duration-300"
                  >
                    สร้างแคมเปญใหม่
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Coupons */}
          <Card 
            variant="glass" 
            className="border-white/20 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-105 animate-slide-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                    <Gift className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-green-900 to-emerald-900 bg-clip-text text-transparent">
                      คูปองส่วนลด
                    </h3>
                    <p className="text-sm text-gray-600">สร้างและจัดการคูปอง</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Link href="/dashboard/marketing/coupons">
                  <Button 
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl px-4 py-3 font-medium transition-all duration-300"
                  >
                    จัดการคูปอง
                  </Button>
                </Link>
                <Link href="/dashboard/marketing/coupons/create">
                  <Button 
                    className="w-full bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200 text-slate-700 hover:from-slate-100 hover:to-gray-100 hover:border-slate-300 rounded-xl px-4 py-3 font-medium transition-all duration-300"
                  >
                    สร้างคูปองใหม่
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Email Marketing */}
          <Card 
            variant="glass" 
            className="border-white/20 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-105 animate-slide-in-up"
            style={{ animationDelay: '0.3s' }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-900 to-pink-900 bg-clip-text text-transparent">
                      Email Marketing
                    </h3>
                    <p className="text-sm text-gray-600">ส่งอีเมลและจดหมายข่าว</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Link href="/dashboard/marketing/emails">
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl px-4 py-3 font-medium transition-all duration-300"
                  >
                    จัดการอีเมล
                  </Button>
                </Link>
                <Link href="/dashboard/marketing/subscribers">
                  <Button 
                    className="w-full bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200 text-slate-700 hover:from-slate-100 hover:to-gray-100 hover:border-slate-300 rounded-xl px-4 py-3 font-medium transition-all duration-300"
                  >
                    ผู้ติดตาม
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Analytics */}
          <Card 
            variant="glass" 
            className="border-white/20 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-105 animate-slide-in-up"
            style={{ animationDelay: '0.4s' }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-orange-900 to-red-900 bg-clip-text text-transparent">
                      การวิเคราะห์
                    </h3>
                    <p className="text-sm text-gray-600">รายงานและสถิติการตลาด</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Link href="/dashboard/marketing/analytics">
                  <Button 
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl px-4 py-3 font-medium transition-all duration-300"
                  >
                    ดูรายงาน
                  </Button>
                </Link>
                <Link href="/dashboard/marketing/performance">
                  <Button 
                    className="w-full bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200 text-slate-700 hover:from-slate-100 hover:to-gray-100 hover:border-slate-300 rounded-xl px-4 py-3 font-medium transition-all duration-300"
                  >
                    ประสิทธิภาพ
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Customer Segmentation */}
          <Card 
            variant="glass" 
            className="border-white/20 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-105 animate-slide-in-up"
            style={{ animationDelay: '0.5s' }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-900 to-blue-900 bg-clip-text text-transparent">
                      การแบ่งกลุ่มลูกค้า
                    </h3>
                    <p className="text-sm text-gray-600">จัดกลุ่มและกำหนดเป้าหมาย</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Link href="/dashboard/marketing/segments">
                  <Button 
                    className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white rounded-xl px-4 py-3 font-medium transition-all duration-300"
                  >
                    จัดการกลุ่ม
                  </Button>
                </Link>
                <Link href="/dashboard/marketing/targeting">
                  <Button 
                    className="w-full bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200 text-slate-700 hover:from-slate-100 hover:to-gray-100 hover:border-slate-300 rounded-xl px-4 py-3 font-medium transition-all duration-300"
                  >
                    กำหนดเป้าหมาย
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Customer Analysis */}
          <Card 
            variant="glass" 
            className="border-white/20 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-105 animate-slide-in-up"
            style={{ animationDelay: '0.6s' }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-teal-500 to-green-600 rounded-lg">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-teal-900 to-green-900 bg-clip-text text-transparent">
                      วิเคราะห์ลูกค้า
                    </h3>
                    <p className="text-sm text-gray-600">พฤติกรรมและแนวโน้ม</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Link href="/dashboard/marketing/customer-insights">
                  <Button 
                    className="w-full bg-gradient-to-r from-teal-500 to-green-600 hover:from-teal-600 hover:to-green-700 text-white rounded-xl px-4 py-3 font-medium transition-all duration-300"
                  >
                    ข้อมูลเชิงลึก
                  </Button>
                </Link>
                <Link href="/dashboard/marketing/behavior">
                  <Button 
                    className="w-full bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200 text-slate-700 hover:from-slate-100 hover:to-gray-100 hover:border-slate-300 rounded-xl px-4 py-3 font-medium transition-all duration-300"
                  >
                    วิเคราะห์ลูกค้า
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>

        {/* Tips & Best Practices */}
        <Card variant="glass" className="border-white/20 backdrop-blur-sm bg-gradient-to-br from-blue-50/80 to-indigo-50/80 animate-slide-in-up" style={{ animationDelay: '0.8s' }}>
          <div className="p-6">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent mb-6">
              เคล็ดลับการตลาด
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  การสร้างแคมเปญที่มีประสิทธิภาพ
                </h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    กำหนดเป้าหมายที่ชัดเจนและวัดผลได้
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    เลือกกลุ่มเป้าหมายที่เหมาะสม
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    ใช้ข้อความที่ดึงดูดและชัดเจน
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    ติดตามและปรับปรุงอย่างต่อเนื่อง
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                  การใช้คูปองอย่างมีประสิทธิภาพ
                </h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-start">
                    <span className="text-indigo-500 mr-2">•</span>
                    กำหนดเงื่อนไขที่เหมาะสมกับกลุ่มเป้าหมาย
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-500 mr-2">•</span>
                    ตั้งระยะเวลาที่สร้างความเร่งด่วน
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-500 mr-2">•</span>
                    จำกัดจำนวนการใช้งานเพื่อสร้างความพิเศษ
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-500 mr-2">•</span>
                    วิเคราะห์ผลการใช้งานเพื่อปรับปรุง
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}