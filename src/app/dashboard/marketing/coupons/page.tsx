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
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      expired: 'bg-red-100 text-red-800',
      scheduled: 'bg-blue-100 text-blue-800'
    }
    
    const labels = {
      active: 'ใช้งาน',
      inactive: 'ปิดใช้งาน',
      expired: 'หมดอายุ',
      scheduled: 'รอเริ่มต้น'
    }
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  if (!session) {
    return <div>กำลังโหลด...</div>
  }

  const canManage = ['ADMIN', 'MANAGER'].includes(session.user.role)

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">จัดการคูปอง</h1>
        <p className="text-gray-600">สร้างและจัดการคูปองส่วนลดสำหรับลูกค้า</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">คูปองทั้งหมด</h3>
            <p className="text-2xl font-bold text-gray-900">{summary.totalCoupons}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">ใช้งานได้</h3>
            <p className="text-2xl font-bold text-green-600">{summary.activeCoupons}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">หมดอายุ</h3>
            <p className="text-2xl font-bold text-red-600">{summary.expiredCoupons}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">การใช้งานรวม</h3>
            <p className="text-2xl font-bold text-blue-600">{summary.totalUsage}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">ส่วนลดรวม</h3>
            <p className="text-2xl font-bold text-purple-600">{formatCurrency(summary.totalDiscountGiven)}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <input
                type="text"
                placeholder="ค้นหาคูปอง..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">สถานะทั้งหมด</option>
                <option value="active">ใช้งานได้</option>
                <option value="inactive">ปิดใช้งาน</option>
                <option value="expired">หมดอายุ</option>
              </select>
            </div>
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">ประเภททั้งหมด</option>
                <option value="PERCENTAGE">เปอร์เซ็นต์</option>
                <option value="FIXED">จำนวนเงิน</option>
              </select>
            </div>
            <div>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-')
                  setSortBy(field)
                  setSortOrder(order)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="createdAt-desc">วันที่สร้าง (ใหม่ล่าสุด)</option>
                <option value="createdAt-asc">วันที่สร้าง (เก่าสุด)</option>
                <option value="code-asc">รหัสคูปอง (A-Z)</option>
                <option value="usageCount-desc">การใช้งาน (มาก-น้อย)</option>
              </select>
            </div>
          </div>
          <div className="flex justify-between">
            <button
              type="button"
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              ล้างตัวกรอง
            </button>
            <div className="space-x-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                ค้นหา
              </button>
              {canManage && (
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  สร้างคูปอง
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center">กำลังโหลด...</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    คูปอง
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ประเภท
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    เงื่อนไข
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    การใช้งาน
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    วันหมดอายุ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สถานะ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    การดำเนินการ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {coupon.code}
                        </div>
                        <div className="text-sm text-gray-500">
                          {coupon.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : formatCurrency(coupon.value)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {coupon.type === 'PERCENTAGE' ? 'เปอร์เซ็นต์' : 'จำนวนเงิน'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ขั้นต่ำ {formatCurrency(coupon.minimumOrder)}
                      </div>
                      {coupon.maximumDiscount && (
                        <div className="text-sm text-gray-500">
                          สูงสุด {formatCurrency(coupon.maximumDiscount)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {coupon.usageCount} / {coupon.usageLimit}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(coupon.usageCount / coupon.usageLimit) * 100}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(coupon.endDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(getCouponStatus(coupon))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-y-1">
                      <button
                        onClick={() => openCouponModal(coupon)}
                        className="text-blue-600 hover:text-blue-900 block"
                      >
                        ดูรายละเอียด
                      </button>
                      {canManage && (
                        <button
                          onClick={() => updateCouponStatus(coupon.id, !coupon.isActive)}
                          className={`block ${
                            coupon.isActive 
                              ? 'text-red-600 hover:text-red-900' 
                              : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {coupon.isActive ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ก่อนหน้า
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ถัดไป
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    แสดง <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> ถึง{' '}
                    <span className="font-medium">{Math.min(currentPage * 10, totalCoupons)}</span> จาก{' '}
                    <span className="font-medium">{totalCoupons}</span> รายการ
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ก่อนหน้า
                    </button>
                    
                    {[...Array(Math.min(5, totalPages))].map((_, index) => {
                      const page = index + 1
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === page
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    })}

                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">รายละเอียดคูปอง</h3>
              <button
                onClick={() => setShowCouponModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">รหัสคูปอง</label>
                  <p className="mt-1 text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                    {selectedCoupon.code}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ชื่อคูปอง</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedCoupon.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ประเภท</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedCoupon.type === 'PERCENTAGE' ? 'เปอร์เซ็นต์' : 'จำนวนเงิน'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ค่าส่วนลด</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedCoupon.type === 'PERCENTAGE' 
                      ? `${selectedCoupon.value}%` 
                      : formatCurrency(selectedCoupon.value)
                    }
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ยอดขั้นต่ำ</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatCurrency(selectedCoupon.minimumOrder)}
                  </p>
                </div>
                {selectedCoupon.maximumDiscount && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ส่วนลดสูงสุด</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatCurrency(selectedCoupon.maximumDiscount)}
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">วันที่เริ่มต้น</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(selectedCoupon.startDate)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">วันหมดอายุ</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(selectedCoupon.endDate)}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">คำอธิบาย</label>
                <p className="mt-1 text-sm text-gray-900">{selectedCoupon.description}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">การใช้งาน</label>
                <div className="mt-1 flex items-center space-x-4">
                  <span className="text-sm text-gray-900">
                    {selectedCoupon.usageCount} / {selectedCoupon.usageLimit} ครั้ง
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(selectedCoupon.usageCount / selectedCoupon.usageLimit) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">สถานะ</label>
                <div className="mt-1">
                  {getStatusBadge(getCouponStatus(selectedCoupon))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowCouponModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                ปิด
              </button>
              {canManage && (
                <button
                  onClick={() => updateCouponStatus(selectedCoupon.id, !selectedCoupon.isActive)}
                  className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
                    selectedCoupon.isActive 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {selectedCoupon.isActive ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Coupon Modal */}
      {showCreateModal && canManage && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">สร้างคูปองใหม่</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    รหัสคูปอง *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="เช่น SALE20"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ชื่อคูปอง *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="ชื่อคูปอง"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    คำอธิบาย
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="คำอธิบายคูปอง"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ประเภทส่วนลด *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as 'PERCENTAGE' | 'FIXED'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="PERCENTAGE">เปอร์เซ็นต์</option>
                    <option value="FIXED">จำนวนเงิน</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ค่าส่วนลด *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step={formData.type === 'PERCENTAGE' ? '1' : '0.01'}
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder={formData.type === 'PERCENTAGE' ? 'เช่น 10' : 'เช่น 50'}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ยอดขั้นต่ำ *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.minimumOrder}
                    onChange={(e) => setFormData({...formData, minimumOrder: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="ยอดขั้นต่ำ"
                  />
                </div>
                
                {formData.type === 'PERCENTAGE' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ส่วนลดสูงสุด
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.maximumDiscount}
                      onChange={(e) => setFormData({...formData, maximumDiscount: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="ส่วนลดสูงสุด"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    จำนวนครั้งที่ใช้ได้ *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({...formData, usageLimit: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="จำนวนครั้ง"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    วันที่เริ่มต้น *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    วันหมดอายุ *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="h-4 w-4 text-blue-600 mr-2"
                />
                <label className="text-sm text-gray-700">เปิดใช้งานทันที</label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  สร้างคูปอง
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}