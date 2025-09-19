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

  const canManage = ['ADMIN', 'MANAGER'].includes(session.user.role)

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
          <Card variant="glass" className="border-white/20 backdrop-blur-sm">
            <div className="p-6">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                เครื่องมือการตลาด
              </h1>
              <p className="mt-2 text-slate-600">จัดการแคมเปญ คูปอง และกิจกรรมการตลาดทั้งหมด</p>
            </div>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 relative">
          <StatCard
            title="แคมเปญที่ใช้งาน"
            value={marketingStats.activeCampaigns.toString()}
            trend={{
              value: 15,
              isPositive: true,
              period: 'active campaigns'
            }}
            icon={Target}
            color="blue"
            className="animate-slide-in-up"
            style={{ animationDelay: '0.1s' }}
          />
          <StatCard
            title="คูปองที่ใช้งาน"
            value={marketingStats.activeCoupons.toString()}
            trend={{
              value: 25,
              isPositive: true,
              period: 'active coupons'
            }}
            icon={Gift}
            color="green"
            className="animate-slide-in-up"
            style={{ animationDelay: '0.2s' }}
          />
          <StatCard
            title="ยอดเข้าถึงรวม"
            value={marketingStats.totalReach.toLocaleString()}
            trend={{
              value: 12,
              isPositive: true,
              period: 'total reach'
            }}
            icon={Users}
            color="purple"
            className="animate-slide-in-up"
            style={{ animationDelay: '0.3s' }}
          />
          <StatCard
            title="อัตราการแปลง"
            value={`${marketingStats.conversionRate}%`}
            trend={{
              value: 8,
              isPositive: true,
              period: 'conversion rate'
            }}
            icon={TrendingUp}
            color="red"
            className="animate-slide-in-up"
            style={{ animationDelay: '0.4s' }}
          />
          <StatCard
            title="ROAS เฉลี่ย"
            value={`${marketingStats.averageROAS}x`}
            trend={{
              value: 18,
              isPositive: true,
              period: 'average ROAS'
            }}
            icon={DollarSign}
            color="yellow"
            className="animate-slide-in-up"
            style={{ animationDelay: '0.5s' }}
          />
          <StatCard
            title="ผู้ติดตามอีเมล"
            value={marketingStats.emailSubscribers.toLocaleString()}
            trend={{
              value: 22,
              isPositive: true,
              period: 'subscribers'
            }}
            icon={Mail}
            color="indigo"
            className="animate-slide-in-up"
            style={{ animationDelay: '0.6s' }}
          />
        </div>
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
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center border border-blue-200/50">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-slate-500 truncate">
                      แคมเปญการตลาด
                    </dt>
                    <dd className="text-lg font-semibold text-slate-900">
                      จัดการแคมเปญโปรโมชั่น
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-slate-600">
                  สร้างและจัดการแคมเปญการตลาด ติดตามผลการดำเนินงาน และวิเคราะห์ ROI
                </p>
              </div>
              <div className="mt-6">
                <Link href="/dashboard/marketing/campaigns">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 transition-all duration-300 rounded-xl"
                  >
                    จัดการแคมเปญ
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
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center border border-green-200/50">
                    <Gift className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-slate-500 truncate">
                      คูปองส่วนลด
                    </dt>
                    <dd className="text-lg font-semibold text-slate-900">
                      จัดการโค้ดส่วนลด
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-slate-600">
                  สร้างและจัดการคูปองส่วนลด ติดตามการใช้งาน และวิเคราะห์ประสิทธิภาพ
                </p>
              </div>
              <div className="mt-6">
                <Link href="/dashboard/marketing/coupons">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-700 hover:from-green-100 hover:to-emerald-100 hover:border-green-300 transition-all duration-300 rounded-xl"
                  >
                    จัดการคูปอง
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
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-violet-100 rounded-xl flex items-center justify-center border border-purple-200/50">
                    <Mail className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-slate-500 truncate">
                      Email Marketing
                    </dt>
                    <dd className="text-lg font-semibold text-slate-900">
                      จัดการอีเมลการตลาด
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-slate-600">
                  สร้างและส่งอีเมลการตลาด จัดการรายชื่อลูกค้า และติดตามอัตราเปิดอ่าน
                </p>
              </div>
              <div className="mt-6">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled
                  className="w-full bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200 text-purple-700 opacity-60 rounded-xl"
                >
                  เร็วๆ นี้
                </Button>
              </div>
            </div>
          </Card>

          {/* Social Media */}
          <Card 
            variant="glass" 
            className="border-white/20 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-105 animate-slide-in-up"
            style={{ animationDelay: '0.4s' }}
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl flex items-center justify-center border border-pink-200/50">
                    <Users className="w-6 h-6 text-pink-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-slate-500 truncate">
                      Social Media
                    </dt>
                    <dd className="text-lg font-semibold text-slate-900">
                      จัดการโซเชียลมีเดีย
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-slate-600">
                  จัดการเนื้อหาโซเชียลมีเดีย กำหนดเวลาโพสต์ และติดตามการมีส่วนร่วม
                </p>
              </div>
              <div className="mt-6">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled
                  className="w-full bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200 text-pink-700 opacity-60 rounded-xl"
                >
                  เร็วๆ นี้
                </Button>
              </div>
            </div>
          </Card>

          {/* Analytics */}
          <Card 
            variant="glass" 
            className="border-white/20 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-105 animate-slide-in-up"
            style={{ animationDelay: '0.5s' }}
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-xl flex items-center justify-center border border-indigo-200/50">
                    <BarChart3 className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-slate-500 truncate">
                      การวิเคราะห์การตลาด
                    </dt>
                    <dd className="text-lg font-semibold text-slate-900">
                      รายงานและวิเคราะห์
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-slate-600">
                  วิเคราะห์ประสิทธิภาพการตลาด ติดตาม ROI และสร้างรายงานแคมเปญ
                </p>
              </div>
              <div className="mt-6">
                <Link href="/dashboard/analytics">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200 text-indigo-700 hover:from-indigo-100 hover:to-blue-100 hover:border-indigo-300 transition-all duration-300 rounded-xl"
                  >
                    ดูรายงาน
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Customer Segmentation */}
          <Card 
            variant="glass" 
            className="border-white/20 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-105 animate-slide-in-up"
            style={{ animationDelay: '0.6s' }}
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-xl flex items-center justify-center border border-yellow-200/50">
                    <Users className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-slate-500 truncate">
                      การแบ่งกลุ่มลูกค้า
                    </dt>
                    <dd className="text-lg font-semibold text-slate-900">
                      จัดกลุ่มเป้าหมาย
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-slate-600">
                  แบ่งกลุ่มลูกค้าตามพฤติกรรม ความสนใจ และข้อมูลประชากรศาสตร์
                </p>
              </div>
              <div className="mt-6">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled
                  className="w-full bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 text-yellow-700 opacity-60 rounded-xl"
                >
                  เร็วๆ นี้
                </Button>
              </div>
            </div>
          </Card>

        </div>

        {/* Quick Actions */}
        {canManage && (
          <Card variant="glass" className="border-white/20 backdrop-blur-sm animate-slide-in-up" style={{ animationDelay: '0.7s' }}>
            <div className="p-6">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent mb-6">
                การดำเนินการด่วน
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/dashboard/marketing/campaigns">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 rounded-xl px-4 py-3 font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                    สร้างแคมเปญใหม่
                  </Button>
                </Link>
                <Link href="/dashboard/marketing/coupons">
                  <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 rounded-xl px-4 py-3 font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                    สร้างคูปองใหม่
                  </Button>
                </Link>
                <Link href="/dashboard/analytics">
                  <Button 
                    variant="outline"
                    className="w-full bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200 text-slate-700 hover:from-slate-100 hover:to-gray-100 hover:border-slate-300 rounded-xl px-4 py-3 font-medium transition-all duration-300"
                  >
                    ดูรายงานการตลาด
                  </Button>
                </Link>
                <Link href="/dashboard/customers">
                  <Button 
                    variant="outline"
                    className="w-full bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200 text-slate-700 hover:from-slate-100 hover:to-gray-100 hover:border-slate-300 rounded-xl px-4 py-3 font-medium transition-all duration-300"
                  >
                    วิเคราะห์ลูกค้า
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        )}

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
          </Card>
        </div>
      </div>
    </div>
  )
}