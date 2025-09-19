'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useToastNotification } from '@/hooks/use-toast-notification'

interface Coupon {
  id: string
  code: string
  name: string
  description: string
  type: 'PERCENTAGE' | 'FIXED'
  value: number
  minimumOrder: number
  maximumDiscount: number | null
  usageLimit: number
  usageCount: number
  isActive: boolean
  startDate: Date
  endDate: Date
  applicableProducts: string[]
  applicableCategories: string[]
  customerSegments: string[]
  createdAt: Date
  updatedAt: Date
}

interface CouponSummary {
  totalCoupons: number
  activeCoupons: number
  expiredCoupons: number
  totalUsage: number
  totalDiscountGiven: number
}

export default function CouponsPage() {
  const { data: session } = useSession()
  const toast = useToastNotification()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [summary, setSummary] = useState<CouponSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null)
  const [showCouponModal, setShowCouponModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  // Form state for creating/editing coupons
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    value: 0,
    minimumOrder: 0,
    maximumDiscount: 0,
    usageLimit: 1,
    startDate: '',
    endDate: '',
    isActive: true
  })
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCoupons, setTotalCoupons] = useState(0)

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm,
        status: statusFilter,
        type: typeFilter,
        sortBy,
        sortOrder
      })

      const response = await fetch(`/api/marketing/coupons?${params}`)
      const data = await response.json()

      if (response.ok) {
        setCoupons(data.coupons)
        setSummary(data.summary)
        setTotalPages(data.pagination.totalPages)
        setTotalCoupons(data.pagination.total)
      }
    } catch (error) {
      console.error('Error fetching coupons:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchCoupons()
    }
  }, [session, currentPage, searchTerm, statusFilter, typeFilter, sortBy, sortOrder])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchCoupons()
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('')
    setTypeFilter('')
    setSortBy('createdAt')
    setSortOrder('desc')
    setCurrentPage(1)
  }

  const openCouponModal = (coupon: Coupon) => {
    setSelectedCoupon(coupon)
    setShowCouponModal(true)
  }

  const openCreateModal = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      type: 'PERCENTAGE',
      value: 0,
      minimumOrder: 0,
      maximumDiscount: 0,
      usageLimit: 1,
      startDate: '',
      endDate: '',
      isActive: true
    })
    setShowCreateModal(true)
  }

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/marketing/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setShowCreateModal(false)
        fetchCoupons()
        toast.showSuccess('สร้างคูปองเรียบร้อยแล้ว')
      } else {
        const error = await response.json()
        toast.showError(error.error || 'เกิดข้อผิดพลาด')
      }
    } catch (error) {
      console.error('Error creating coupon:', error)
      toast.showError('เกิดข้อผิดพลาด')
    }
  }

  const updateCouponStatus = async (couponId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/marketing/coupons/${couponId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      })

      if (response.ok) {
        fetchCoupons()
        if (selectedCoupon?.id === couponId) {
          setSelectedCoupon({ ...selectedCoupon, isActive })
        }
      }
    } catch (error) {
      console.error('Error updating coupon status:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(amount)
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('th-TH')
  }

  const getCouponStatus = (coupon: Coupon) => {
    const now = new Date()
    const start = new Date(coupon.startDate)
    const end = new Date(coupon.endDate)
    
    if (!coupon.isActive) return 'inactive'
    if (now < start) return 'scheduled'
    if (now > end) return 'expired'
    return 'active'
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
      inactive: 'bg-gray-100 text-gray-700 border border-gray-200',
      expired: 'bg-red-100 text-red-800 border border-red-200',
      scheduled: 'bg-blue-100 text-blue-800 border border-blue-200'
    }
    
    const labels = {
      active: 'ใช้งานได้',
      inactive: 'ปิดใช้งาน',
      expired: 'หมดอายุ',
      scheduled: 'รอเริ่มต้น'
    }
    
    return (
      <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  if (!session) {
    return <div>กำลังโหลด...</div>
  }

  const canManage = ['ADMIN', 'MANAGER', 'SUPER_ADMIN'].includes(session.user.role)
  
  // Debug info
  console.log('Session:', session)
  console.log('User role:', session.user.role)
  console.log('Can manage:', canManage)

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-3">จัดการคูปอง</h1>
        <p className="text-slate-600 text-lg">สร้างและจัดการคูปองส่วนลดสำหรับลูกค้า</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">คูปองทั้งหมด</h3>
            <p className="text-3xl font-bold text-slate-800">{summary.totalCoupons}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">ใช้งานได้</h3>
            <p className="text-3xl font-bold text-emerald-600">{summary.activeCoupons}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">หมดอายุ</h3>
            <p className="text-3xl font-bold text-red-500">{summary.expiredCoupons}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">การใช้งานรวม</h3>
            <p className="text-3xl font-bold text-blue-600">{summary.totalUsage}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">ส่วนลดรวม</h3>
            <p className="text-3xl font-bold text-purple-600">{formatCurrency(summary.totalDiscountGiven)}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <form onSubmit={handleSearch} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">ค้นหาคูปอง</label>
              <input
                type="text"
                placeholder="กรอกรหัสหรือชื่อคูปอง..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-900 placeholder-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">สถานะ</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-900"
              >
                <option value="">สถานะทั้งหมด</option>
                <option value="active">ใช้งานได้</option>
                <option value="inactive">ปิดใช้งาน</option>
                <option value="expired">หมดอายุ</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">ประเภท</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-900"
              >
                <option value="">ประเภททั้งหมด</option>
                <option value="PERCENTAGE">เปอร์เซ็นต์</option>
                <option value="FIXED">จำนวนเงิน</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">เรียงตาม</label>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-')
                  setSortBy(field)
                  setSortOrder(order)
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-900"
              >
                                <option value="createdAt-desc">วันที่สร้าง (ล่าสุด)</option>
                <option value="createdAt-asc">วันที่สร้าง (เก่าสุด)</option>
                <option value="endDate-asc">วันหมดอายุ (เร็วสุด)</option>
                <option value="endDate-desc">วันหมดอายุ (ช้าสุด)</option>
                <option value="usageCount-desc">การใช้งาน (มากสุด)</option>
                <option value="usageCount-asc">การใช้งาน (น้อยสุด)</option>
              </select>
            </div>
          </div>
          <div className="flex justify-between items-center pt-4">
            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold"
              >
                ค้นหา
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="px-6 py-3 bg-gray-100 text-slate-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-semibold"
              >
                ล้างตัวกรอง
              </button>
            </div>
            <div>
              {canManage && (
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 font-semibold shadow-sm"
                >
                  + สร้างคูปอง
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center">
              <div className="text-slate-600 text-lg">กำลังโหลด...</div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    คูปอง
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    ประเภท
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    เงื่อนไข
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    การใช้งาน
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    วันหมดอายุ
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    สถานะ
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    การดำเนินการ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-slate-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-bold text-slate-900">
                          {coupon.code}
                        </div>
                        <div className="text-sm text-slate-600 font-medium">
                          {coupon.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-900">
                        {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : formatCurrency(coupon.value)}
                      </div>
                      <div className="text-sm text-slate-500">
                        {coupon.type === 'PERCENTAGE' ? 'เปอร์เซ็นต์' : 'จำนวนเงิน'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-slate-900">
                        ขั้นต่ำ {formatCurrency(coupon.minimumOrder)}
                      </div>
                      {coupon.maximumDiscount && (
                        <div className="text-sm text-slate-600">
                          สูงสุด {formatCurrency(coupon.maximumDiscount)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-slate-900 mb-1">
                        {coupon.usageCount} / {coupon.usageLimit}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                          style={{ width: `${(coupon.usageCount / coupon.usageLimit) * 100}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-700">
                      {formatDate(coupon.endDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(getCouponStatus(coupon))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-y-2">
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => openCouponModal(coupon)}
                          className="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-150"
                        >
                          ดูรายละเอียด
                        </button>
                        {canManage && (
                          <button
                            onClick={() => updateCouponStatus(coupon.id, !coupon.isActive)}
                            className={`font-semibold transition-colors duration-150 ${
                              coupon.isActive 
                                ? 'text-red-600 hover:text-red-800' 
                                : 'text-emerald-600 hover:text-emerald-800'
                            }`}
                          >
                            {coupon.isActive ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-slate-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-semibold rounded-lg text-slate-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  ก่อนหน้า
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-semibold rounded-lg text-slate-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  ถัดไป
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-700 font-medium">
                    แสดง <span className="font-bold text-slate-900">{(currentPage - 1) * 10 + 1}</span> ถึง{' '}
                    <span className="font-bold text-slate-900">{Math.min(currentPage * 10, totalCoupons)}</span> จาก{' '}
                    <span className="font-bold text-slate-900">{totalCoupons}</span> รายการ
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-3 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-semibold text-slate-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      ก่อนหน้า
                    </button>
                    
                    {[...Array(Math.min(5, totalPages))].map((_, index) => {
                      const page = index + 1
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-semibold transition-colors duration-200 ${
                            currentPage === page
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-700'
                              : 'bg-white border-gray-300 text-slate-600 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    })}

                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-3 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-semibold text-slate-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      ถัดไป
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Coupon Detail Modal */}
      {showCouponModal && selectedCoupon && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl border border-gray-200">
            <div className="sticky top-0 bg-white px-8 py-6 border-b border-gray-200 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-slate-800">รายละเอียดคูปอง</h3>
                <button
                  onClick={() => setShowCouponModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-2xl font-bold transition-colors duration-200"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">รหัสคูปอง</label>
                  <p className="text-lg font-mono bg-slate-100 text-slate-900 px-4 py-3 rounded-lg border">
                    {selectedCoupon.code}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">ชื่อคูปอง</label>
                  <p className="text-lg text-slate-900 font-semibold">{selectedCoupon.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">ประเภท</label>
                  <p className="text-lg text-slate-900 font-semibold">
                    {selectedCoupon.type === 'PERCENTAGE' ? 'เปอร์เซ็นต์' : 'จำนวนเงิน'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">ค่าส่วนลด</label>
                  <p className="text-lg text-slate-900 font-semibold">
                    {selectedCoupon.type === 'PERCENTAGE' 
                      ? `${selectedCoupon.value}%` 
                      : formatCurrency(selectedCoupon.value)
                    }
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">ยอดขั้นต่ำ</label>
                  <p className="text-lg text-slate-900 font-semibold">
                    {formatCurrency(selectedCoupon.minimumOrder)}
                  </p>
                </div>
                {selectedCoupon.maximumDiscount && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">ส่วนลดสูงสุด</label>
                    <p className="text-lg text-slate-900 font-semibold">
                      {formatCurrency(selectedCoupon.maximumDiscount)}
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">วันที่เริ่มต้น</label>
                  <p className="text-lg text-slate-900 font-semibold">{formatDate(selectedCoupon.startDate)}</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">วันหมดอายุ</label>
                  <p className="text-lg text-slate-900 font-semibold">{formatDate(selectedCoupon.endDate)}</p>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">คำอธิบาย</label>
                <p className="text-base text-slate-700 bg-slate-50 p-4 rounded-lg border">{selectedCoupon.description}</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">การใช้งาน</label>
                <div className="flex items-center space-x-4">
                  <span className="text-lg font-semibold text-slate-900">
                    {selectedCoupon.usageCount} / {selectedCoupon.usageLimit} ครั้ง
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                      style={{ width: `${(selectedCoupon.usageCount / selectedCoupon.usageLimit) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">สถานะ</label>
                <div>
                  {getStatusBadge(getCouponStatus(selectedCoupon))}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white px-8 py-6 border-t border-gray-200 rounded-b-xl">
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowCouponModal(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  ปิด
                </button>
                {canManage && (
                  <button
                    onClick={() => updateCouponStatus(selectedCoupon.id, !selectedCoupon.isActive)}
                    className={`px-6 py-3 rounded-lg text-sm font-semibold text-white transition-colors duration-200 ${
                      selectedCoupon.isActive 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    {selectedCoupon.isActive ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Coupon Modal */}
      {showCreateModal && canManage && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl border border-gray-200">
            <div className="sticky top-0 bg-white px-8 py-6 border-b border-gray-200 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-slate-800">สร้างคูปองใหม่</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-2xl font-bold transition-colors duration-200"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <form onSubmit={handleCreateCoupon} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    รหัสคูปอง *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-900 placeholder-slate-400"
                    placeholder="เช่น SALE20"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    ชื่อคูปอง *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-900 placeholder-slate-400"
                    placeholder="ชื่อคูปอง"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    คำอธิบาย
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-900 placeholder-slate-400"
                    placeholder="คำอธิบายคูปอง"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    ประเภทส่วนลด *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as 'PERCENTAGE' | 'FIXED'})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-900"
                  >
                    <option value="PERCENTAGE">เปอร์เซ็นต์</option>
                    <option value="FIXED">จำนวนเงิน</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    ค่าส่วนลด *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step={formData.type === 'PERCENTAGE' ? '1' : '0.01'}
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: parseFloat(e.target.value)})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-900 placeholder-slate-400"
                    placeholder={formData.type === 'PERCENTAGE' ? 'เช่น 10' : 'เช่น 50'}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    ยอดขั้นต่ำ *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.minimumOrder}
                    onChange={(e) => setFormData({...formData, minimumOrder: parseFloat(e.target.value)})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-900 placeholder-slate-400"
                    placeholder="ยอดขั้นต่ำ"
                  />
                </div>
                
                {formData.type === 'PERCENTAGE' && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      ส่วนลดสูงสุด
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.maximumDiscount}
                      onChange={(e) => setFormData({...formData, maximumDiscount: parseFloat(e.target.value)})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-900 placeholder-slate-400"
                      placeholder="ส่วนลดสูงสุด"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    จำนวนครั้งที่ใช้ได้ *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({...formData, usageLimit: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-900 placeholder-slate-400"
                    placeholder="จำนวนครั้ง"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    วันที่เริ่มต้น *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-900"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    วันหมดอายุ *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-900"
                  />
                </div>
              </div>
              
              <div className="flex items-center mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2 mr-3"
                />
                <label className="text-sm font-semibold text-slate-700">เปิดใช้งานทันที</label>
              </div>
              
              <div className="sticky bottom-0 bg-white pt-6 border-t border-gray-200 mt-8">
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                  >
                    สร้างคูปอง
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}