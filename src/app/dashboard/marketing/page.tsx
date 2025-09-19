'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

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
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">แคมเปญที่ใช้งาน</h3>
          <p className="text-2xl font-bold text-blue-600">{marketingStats.activeCampaigns}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">คูปองที่ใช้งาน</h3>
          <p className="text-2xl font-bold text-green-600">{marketingStats.activeCoupons}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">ยอดเข้าถึงรวม</h3>
          <p className="text-2xl font-bold text-purple-600">{marketingStats.totalReach.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">อัตราการแปลง</h3>
          <p className="text-2xl font-bold text-orange-600">{marketingStats.conversionRate}%</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">ROAS เฉลี่ย</h3>
          <p className="text-2xl font-bold text-red-600">{marketingStats.averageROAS}x</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">สมาชิกอีเมล</h3>
          <p className="text-2xl font-bold text-indigo-600">{marketingStats.emailSubscribers.toLocaleString()}</p>
        </div>
      </div>

      {/* Marketing Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Campaigns */}
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
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
              <Link 
                href="/dashboard/marketing/campaigns"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                จัดการแคมเปญ
                <svg className="ml-2 -mr-0.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Coupons */}
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
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
              <Link 
                href="/dashboard/marketing/coupons"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                จัดการคูปอง
                <svg className="ml-2 -mr-0.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Email Marketing */}
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
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
              <div className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-500 bg-gray-100 cursor-not-allowed">
                เร็วๆ นี้
                <svg className="ml-2 -mr-0.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v3M7 4H5a1 1 0 00-1 1v3m0 0v9a2 2 0 002 2h12a2 2 0 002-2V8M7 4h10M9 9v6m6-6v6" />
                  </svg>
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
              <div className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-500 bg-gray-100 cursor-not-allowed">
                เร็วๆ นี้
                <svg className="ml-2 -mr-0.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics */}
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
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
              <Link 
                href="/dashboard/analytics"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                ดูรายงาน
                <svg className="ml-2 -mr-0.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Customer Segmentation */}
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
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
                แบ่งกลุ่มลูกค้าตามพฤติกรรม สร้างเป้าหมายการตลาดที่เจาะจง
              </p>
            </div>
            <div className="mt-4">
              <Link 
                href="/dashboard/customers"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                จัดการกลุ่มลูกค้า
                <svg className="ml-2 -mr-0.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

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
              <Link 
                href="/dashboard/marketing/coupons"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                สร้างคูปองใหม่
              </Link>
              <Link 
                href="/dashboard/analytics"
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                ดูรายงานการตลาด
              </Link>
              <Link 
                href="/dashboard/customers"
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                วิเคราะห์ลูกค้า
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Tips & Best Practices */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">เคล็ดลับการตลาด</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
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
        </div>
      </div>
    </div>
  )
}