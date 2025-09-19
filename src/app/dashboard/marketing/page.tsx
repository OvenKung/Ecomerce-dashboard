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
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">เครื่องมือการตลาด</h1>
        <p className="text-gray-600">จัดการแคมเปญ คูปอง และกิจกรรมการตลาดทั้งหมด</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard
          title="แคมเปญที่ใช้งาน"
          value={marketingStats.activeCampaigns}
          icon={Target}
          color="blue"
        />
        <StatCard
          title="คูปองที่ใช้งาน"
          value={marketingStats.activeCoupons}
          icon={Gift}
          color="green"
        />
        <StatCard
          title="ยอดเข้าถึงรวม"
          value={marketingStats.totalReach.toLocaleString()}
          icon={Users}
          color="purple"
        />
        <StatCard
          title="อัตราการแปลง"
          value={`${marketingStats.conversionRate}%`}
          icon={TrendingUp}
          color="yellow"
        />
        <StatCard
          title="ROAS เฉลี่ย"
          value={`${marketingStats.averageROAS}x`}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="ผู้ติดตามอีเมล"
          value={marketingStats.emailSubscribers.toLocaleString()}
          icon={Mail}
          color="blue"
        />
      </div>

      {/* Marketing Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Campaigns */}
        <Card className="hover:shadow-lg transition-shadow">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    แคมเปญการตลาด
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    จัดการแคมเปญโปรโมชั่น
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                สร้างและจัดการแคมเปญการตลาด ติดตามผลการดำเนินงาน และวิเคราะห์ ROI
              </p>
            </div>
            <div className="mt-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/marketing/campaigns">
                  จัดการแคมเปญ
                </Link>
              </Button>
            </div>
          </div>
        </Card>

        {/* Coupons */}
        <Card className="hover:shadow-lg transition-shadow">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Gift className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    คูปองส่วนลด
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    จัดการโค้ดส่วนลด
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                สร้างและจัดการคูปองส่วนลด ติดตามการใช้งาน และวิเคราะห์ประสิทธิภาพ
              </p>
            </div>
            <div className="mt-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/marketing/coupons">
                  จัดการคูปอง
                </Link>
              </Button>
            </div>
          </div>
        </Card>

        {/* Email Marketing */}
        <Card className="hover:shadow-lg transition-shadow">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Email Marketing
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    จัดการอีเมลการตลาด
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                สร้างและส่งอีเมลการตลาด จัดการรายชื่อลูกค้า และติดตามอัตราเปิดอ่าน
              </p>
            </div>
            <div className="mt-4">
              <Button variant="outline" size="sm" disabled>
                เร็วๆ นี้
              </Button>
            </div>
          </div>
        </Card>

        {/* Social Media */}
        <Card className="hover:shadow-lg transition-shadow">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-pink-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Social Media
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    จัดการโซเชียลมีเดีย
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                จัดการเนื้อหาโซเชียลมีเดีย กำหนดเวลาโพสต์ และติดตามการมีส่วนร่วม
              </p>
            </div>
            <div className="mt-4">
              <Button variant="outline" size="sm" disabled>
                เร็วๆ นี้
              </Button>
            </div>
          </div>
        </Card>

        {/* Analytics */}
        <Card className="hover:shadow-lg transition-shadow">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    การวิเคราะห์การตลาด
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    รายงานและวิเคราะห์
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                วิเคราะห์ประสิทธิภาพการตลาด ติดตาม ROI และสร้างรายงานแคมเปญ
              </p>
            </div>
            <div className="mt-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/analytics">
                  ดูรายงาน
                </Link>
              </Button>
            </div>
          </div>
        </Card>

        {/* Customer Segmentation */}
        <Card className="hover:shadow-lg transition-shadow">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    การแบ่งกลุ่มลูกค้า
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    จัดกลุ่มเป้าหมาย
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                แบ่งกลุ่มลูกค้าตามพฤติกรรม ความสนใจ และข้อมูลประชากรศาสตร์
              </p>
            </div>
            <div className="mt-4">
              <Button variant="outline" size="sm" disabled>
                เร็วๆ นี้
              </Button>
            </div>
          </div>
        </Card>

      </div>

      {/* Quick Actions */}
      {canManage && (
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">การดำเนินการด่วน</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link 
                href="/dashboard/marketing/campaigns"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                สร้างแคมเปญใหม่
              </Link>
              <Button variant="success" asChild>
                <Link href="/dashboard/marketing/coupons">
                  สร้างคูปองใหม่
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/analytics">
                  ดูรายงานการตลาด
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/customers">
                  วิเคราะห์ลูกค้า
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tips & Best Practices */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">เคล็ดลับการตลาด</h2>
        <Card className="bg-blue-50 border-blue-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-2">การสร้างแคมเปญที่มีประสิทธิภาพ</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• กำหนดเป้าหมายที่ชัดเจนและวัดผลได้</li>
                <li>• เลือกกลุ่มเป้าหมายที่เหมาะสม</li>
                <li>• ใช้ข้อความที่ดึงดูดและชัดเจน</li>
                <li>• ติดตามและปรับปรุงอย่างต่อเนื่อง</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-2">การใช้คูปองอย่างมีประสิทธิภาพ</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• กำหนดเงื่อนไขที่เหมาะสมกับกลุ่มเป้าหมาย</li>
                <li>• ตั้งระยะเวลาที่สร้างความเร่งด่วน</li>
                <li>• จำกัดจำนวนการใช้งานเพื่อสร้างความพิเศษ</li>
                <li>• วิเคราะห์ผลการใช้งานเพื่อปรับปรุง</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}