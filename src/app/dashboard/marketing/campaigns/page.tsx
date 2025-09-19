'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useToastNotification } from '@/hooks/use-toast-notification'

interface Campaign {
  id: string
  name: string
  description: string
  type: string
  status: string
  startDate: Date
  endDate: Date
  budget: number
  spent: number
  impressions: number
  clicks: number
  conversions: number
  revenue: number
  targetAudience: string[]
  channels: string[]
  products: string[]
  metrics: {
    ctr: number
    conversionRate: number
    roas: number
    cpa: number
  }
  createdAt: Date
  updatedAt: Date
}

interface CampaignSummary {
  totalCampaigns: number
  activeCampaigns: number
  completedCampaigns: number
  scheduledCampaigns: number
  totalBudget: number
  totalSpent: number
  totalRevenue: number
  totalConversions: number
  averageROAS: number
}

export default function CampaignsPage() {
  const { data: session } = useSession()
  const toast = useToastNotification()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [summary, setSummary] = useState<CampaignSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [showCampaignModal, setShowCampaignModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  // Form state for creating/editing campaigns
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'DISCOUNT_CAMPAIGN',
    budget: 0,
    startDate: '',
    endDate: '',
    targetAudience: [] as string[],
    channels: [] as string[],
    products: [] as string[],
    status: 'SCHEDULED'
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
  const [totalCampaigns, setTotalCampaigns] = useState(0)

  const fetchCampaigns = async () => {
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

      const response = await fetch(`/api/marketing/campaigns?${params}`)
      const data = await response.json()

      if (response.ok) {
        setCampaigns(data.campaigns)
        setSummary(data.summary)
        setTotalPages(data.pagination.totalPages)
        setTotalCampaigns(data.pagination.total)
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchCampaigns()
    }
  }, [session, currentPage, searchTerm, statusFilter, typeFilter, sortBy, sortOrder])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchCampaigns()
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('')
    setTypeFilter('')
    setSortBy('createdAt')
    setSortOrder('desc')
    setCurrentPage(1)
  }

  const openCampaignModal = (campaign: Campaign) => {
    setSelectedCampaign(campaign)
    setShowCampaignModal(true)
  }

  const openCreateModal = () => {
    setFormData({
      name: '',
      description: '',
      type: 'DISCOUNT_CAMPAIGN',
      budget: 0,
      startDate: '',
      endDate: '',
      targetAudience: [],
      channels: [],
      products: [],
      status: 'SCHEDULED'
    })
    setShowCreateModal(true)
  }

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/marketing/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setShowCreateModal(false)
        fetchCampaigns()
        toast.showSuccess('สร้างแคมเปญเรียบร้อยแล้ว')
      } else {
        const error = await response.json()
        toast.showError(error.error || 'เกิดข้อผิดพลาด')
      }
    } catch (error) {
      console.error('Error creating campaign:', error)
      toast.showError('เกิดข้อผิดพลาด')
    }
  }

  const updateCampaignStatus = async (campaignId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/marketing/campaigns/${campaignId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchCampaigns()
        if (selectedCampaign?.id === campaignId) {
          setSelectedCampaign({ ...selectedCampaign, status: newStatus })
        }
      }
    } catch (error) {
      console.error('Error updating campaign status:', error)
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

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('th-TH').format(num)
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      ACTIVE: 'bg-green-100 text-green-800',
      PAUSED: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
      SCHEDULED: 'bg-purple-100 text-purple-800',
      CANCELLED: 'bg-red-100 text-red-800'
    }
    
    const labels = {
      ACTIVE: 'กำลังดำเนินการ',
      PAUSED: 'หยุดชั่วคราว',
      COMPLETED: 'เสร็จสิ้น',
      SCHEDULED: 'รอเริ่มต้น',
      CANCELLED: 'ยกเลิก'
    }
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const getTypeBadge = (type: string) => {
    const badges = {
      DISCOUNT_CAMPAIGN: 'bg-orange-100 text-orange-800',
      EMAIL_CAMPAIGN: 'bg-blue-100 text-blue-800',
      SEASONAL_CAMPAIGN: 'bg-green-100 text-green-800',
      INFLUENCER_CAMPAIGN: 'bg-pink-100 text-pink-800',
      SOCIAL_MEDIA_CAMPAIGN: 'bg-purple-100 text-purple-800'
    }
    
    const labels = {
      DISCOUNT_CAMPAIGN: 'ส่วนลด',
      EMAIL_CAMPAIGN: 'อีเมล',
      SEASONAL_CAMPAIGN: 'ตามฤดูกาล',
      INFLUENCER_CAMPAIGN: 'อินฟลูเอนเซอร์',
      SOCIAL_MEDIA_CAMPAIGN: 'โซเชียลมีเดีย'
    }
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${badges[type as keyof typeof badges]}`}>
        {labels[type as keyof typeof labels]}
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">จัดการแคมเปญการตลาด</h1>
        <p className="text-gray-600">สร้างและจัดการแคมเปญการตลาดและโปรโมชั่น</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">แคมเปญทั้งหมด</h3>
            <p className="text-2xl font-bold text-gray-900">{summary.totalCampaigns}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">กำลังดำเนินการ</h3>
            <p className="text-2xl font-bold text-green-600">{summary.activeCampaigns}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">งบประมาณทั้งหมด</h3>
            <p className="text-xl font-bold text-blue-600">{formatCurrency(summary.totalBudget)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">รายได้รวม</h3>
            <p className="text-xl font-bold text-purple-600">{formatCurrency(summary.totalRevenue)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">ROAS เฉลี่ย</h3>
            <p className="text-2xl font-bold text-orange-600">{summary.averageROAS?.toFixed(2)}x</p>
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
                placeholder="ค้นหาแคมเปญ..."
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
                <option value="ACTIVE">กำลังดำเนินการ</option>
                <option value="PAUSED">หยุดชั่วคราว</option>
                <option value="COMPLETED">เสร็จสิ้น</option>
                <option value="SCHEDULED">รอเริ่มต้น</option>
              </select>
            </div>
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">ประเภททั้งหมด</option>
                <option value="DISCOUNT_CAMPAIGN">ส่วนลด</option>
                <option value="EMAIL_CAMPAIGN">อีเมล</option>
                <option value="SEASONAL_CAMPAIGN">ตามฤดูกาล</option>
                <option value="INFLUENCER_CAMPAIGN">อินฟลูเอนเซอร์</option>
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
                <option value="budget-desc">งบประมาณ (มาก-น้อย)</option>
                <option value="revenue-desc">รายได้ (มาก-น้อย)</option>
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
                  สร้างแคมเปญ
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center">กำลังโหลด...</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    แคมเปญ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ประเภท
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    งบประมาณ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ผลการดำเนินงาน
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    วันที่
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
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {campaign.name}
                        </div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {campaign.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTypeBadge(campaign.type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(campaign.budget)}
                      </div>
                      <div className="text-sm text-gray-500">
                        ใช้แล้ว: {formatCurrency(campaign.spent)}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${Math.min((campaign.spent / campaign.budget) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        รายได้: {formatCurrency(campaign.revenue)}
                      </div>
                      <div className="text-sm text-gray-500">
                        คอนเวอร์ชั่น: {formatNumber(campaign.conversions)}
                      </div>
                      <div className="text-sm text-gray-500">
                        ROAS: {campaign.metrics.roas.toFixed(2)}x
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(campaign.startDate)}
                      </div>
                      <div className="text-sm text-gray-500">
                        ถึง {formatDate(campaign.endDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(campaign.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-y-1">
                      <button
                        onClick={() => openCampaignModal(campaign)}
                        className="text-blue-600 hover:text-blue-900 block"
                      >
                        ดูรายละเอียด
                      </button>
                      {canManage && (
                        <>
                          {campaign.status === 'ACTIVE' && (
                            <button
                              onClick={() => updateCampaignStatus(campaign.id, 'PAUSED')}
                              className="text-yellow-600 hover:text-yellow-900 block"
                            >
                              หยุดชั่วคราว
                            </button>
                          )}
                          {campaign.status === 'PAUSED' && (
                            <button
                              onClick={() => updateCampaignStatus(campaign.id, 'ACTIVE')}
                              className="text-green-600 hover:text-green-900 block"
                            >
                              เริ่มต้น
                            </button>
                          )}
                          {campaign.status === 'SCHEDULED' && (
                            <button
                              onClick={() => updateCampaignStatus(campaign.id, 'ACTIVE')}
                              className="text-green-600 hover:text-green-900 block"
                            >
                              เริ่มเลย
                            </button>
                          )}
                        </>
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
                    <span className="font-medium">{Math.min(currentPage * 10, totalCampaigns)}</span> จาก{' '}
                    <span className="font-medium">{totalCampaigns}</span> รายการ
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

      {/* Campaign Detail Modal */}
      {showCampaignModal && selectedCampaign && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">รายละเอียดแคมเปญ</h3>
              <button
                onClick={() => setShowCampaignModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">ข้อมูลพื้นฐาน</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ชื่อแคมเปญ</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedCampaign.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ประเภท</label>
                    <div className="mt-1">{getTypeBadge(selectedCampaign.type)}</div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">คำอธิบาย</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedCampaign.description}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">วันที่เริ่มต้น</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedCampaign.startDate)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">วันสิ้นสุด</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedCampaign.endDate)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">สถานะ</label>
                    <div className="mt-1">{getStatusBadge(selectedCampaign.status)}</div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">ผลการดำเนินงาน</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-500">งบประมาณ</p>
                    <p className="text-lg font-semibold">{formatCurrency(selectedCampaign.budget)}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-500">ใช้ไปแล้ว</p>
                    <p className="text-lg font-semibold">{formatCurrency(selectedCampaign.spent)}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-500">รายได้</p>
                    <p className="text-lg font-semibold text-green-600">{formatCurrency(selectedCampaign.revenue)}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-500">คอนเวอร์ชั่น</p>
                    <p className="text-lg font-semibold">{formatNumber(selectedCampaign.conversions)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-500">อิมเพรสชั่น</p>
                    <p className="text-lg font-semibold">{formatNumber(selectedCampaign.impressions)}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-500">คลิก</p>
                    <p className="text-lg font-semibold">{formatNumber(selectedCampaign.clicks)}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-500">CTR</p>
                    <p className="text-lg font-semibold">{selectedCampaign.metrics.ctr.toFixed(2)}%</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-500">ROAS</p>
                    <p className="text-lg font-semibold text-blue-600">{selectedCampaign.metrics.roas.toFixed(2)}x</p>
                  </div>
                </div>
              </div>

              {/* Target & Channels */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">กลุ่มเป้าหมายและช่องทาง</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">กลุ่มเป้าหมาย</label>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {selectedCampaign.targetAudience.map((audience, index) => (
                        <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                          {audience}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ช่องทางการตลาด</label>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {selectedCampaign.channels.map((channel, index) => (
                        <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                          {channel}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowCampaignModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                ปิด
              </button>
              {canManage && selectedCampaign.status === 'ACTIVE' && (
                <button
                  onClick={() => updateCampaignStatus(selectedCampaign.id, 'PAUSED')}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md text-sm font-medium hover:bg-yellow-700"
                >
                  หยุดชั่วคราว
                </button>
              )}
              {canManage && selectedCampaign.status === 'PAUSED' && (
                <button
                  onClick={() => updateCampaignStatus(selectedCampaign.id, 'ACTIVE')}
                  className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                >
                  เริ่มต้น
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreateModal && canManage && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">สร้างแคมเปญใหม่</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ชื่อแคมเปญ *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="ชื่อแคมเปญ"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    คำอธิบาย *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="คำอธิบายแคมเปญ"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ประเภทแคมเปญ *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="DISCOUNT_CAMPAIGN">แคมเปญส่วนลด</option>
                    <option value="EMAIL_CAMPAIGN">แคมเปญอีเมล</option>
                    <option value="SEASONAL_CAMPAIGN">แคมเปญตามฤดูกาล</option>
                    <option value="INFLUENCER_CAMPAIGN">แคมเปญอินฟลูเอนเซอร์</option>
                    <option value="SOCIAL_MEDIA_CAMPAIGN">แคมเปญโซเชียลมีเดีย</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    งบประมาณ *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="งบประมาณ"
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
                    วันสิ้นสุด *
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
                  สร้างแคมเปญ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}