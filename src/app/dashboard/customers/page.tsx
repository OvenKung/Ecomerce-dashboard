'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useToastNotification } from '@/hooks/use-toast-notification'
import { Button, IconButton } from '@/components/ui/button'
import { Card, StatCard } from '@/components/ui/card'
import { 
  EnhancedTable, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell, 
  Badge, 
  Pagination 
} from '@/components/ui/table'
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Users, 
  User,
  UserCheck, 
  UserMinus,
  UserPlus,
  Star, 
  Calendar,
  Mail,
  Phone
} from 'lucide-react'

interface Customer {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  birthDate?: string | null
  status: 'ACTIVE' | 'INACTIVE' | 'BLACKLISTED'
  segment: 'VIP' | 'REGULAR' | 'NEW' | 'AT_RISK'
  notes?: string
  tags?: string[]
  addresses?: Array<{
    id: string
    type: string
    fullName: string
    phone: string
    address: string
    district: string
    province: string
    postalCode: string
    isDefault: boolean
  }>
  totalOrders: number
  totalSpent: number
  lastOrderAt?: Date | null
  lastOrderDate?: Date | null
  createdAt: Date
  updatedAt: Date
}

// Helper function to get full name
const getFullName = (customer: Customer) => {
  const fullName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim()
  return fullName || 'ไม่ระบุชื่อ'
}

// Helper function to get initials
const getInitials = (customer: Customer) => {
  const firstInitial = customer.firstName?.charAt(0) || ''
  const lastInitial = customer.lastName?.charAt(0) || ''
  return (firstInitial + lastInitial) || '?'
}

interface CustomerSummary {
  totalCustomers: number
  activeCustomers: number
  verifiedCustomers: number
  newThisMonth: number
  totalRevenue: number
}

export default function CustomersPage() {
  const { data: session } = useSession()
  const toast = useToastNotification()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [summary, setSummary] = useState<CustomerSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editCustomer, setEditCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    status: 'ACTIVE' as Customer['status'],
    segment: 'REGULAR' as Customer['segment'],
    notes: ''
  })
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [verifiedFilter, setVerifiedFilter] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCustomers, setTotalCustomers] = useState(0)

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: debouncedSearchTerm,
        status: statusFilter,
        verified: verifiedFilter,
        sortBy,
        sortOrder
      })

      const response = await fetch(`/api/customers?${params}`)
      const data = await response.json()

      if (response.ok) {
        setCustomers(data.customers)
        setSummary(data.summary)
        setTotalPages(data.pagination.totalPages)
        setTotalCustomers(data.pagination.total)
      } else {
        toast.showError('ไม่สามารถโหลดข้อมูลลูกค้าได้')
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
      toast.showError('เกิดข้อผิดพลาดในการโหลดข้อมูล')
    } finally {
      setLoading(false)
    }
  }

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setCurrentPage(1) // Reset to first page when searching
    }, 500) // Wait 500ms after user stops typing

    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    if (session) {
      fetchCustomers()
    }
  }, [session, currentPage, debouncedSearchTerm, statusFilter, verifiedFilter, sortBy, sortOrder])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchCustomers()
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('')
    setVerifiedFilter('')
    setSortBy('createdAt')
    setSortOrder('desc')
    setCurrentPage(1)
  }

  const openCustomerModal = (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowCustomerModal(true)
  }

  const updateCustomerStatus = async (customerId: string, status: Customer['status']) => {
    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        fetchCustomers()
        if (selectedCustomer?.id === customerId) {
          setSelectedCustomer({ ...selectedCustomer, status })
        }
      }
    } catch (error) {
      console.error('Error updating customer status:', error)
    }
  }

  const handleEditCustomer = async () => {
    try {
      const response = await fetch(`/api/customers/${selectedCustomer?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editCustomer),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'เกิดข้อผิดพลาด')
      }

      toast.showSuccess('แก้ไขข้อมูลลูกค้าเรียบร้อยแล้ว')
      setShowEditModal(false)
      setSelectedCustomer(null)
      setEditCustomer({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        status: 'ACTIVE',
        segment: 'REGULAR',
        notes: ''
      })
      fetchCustomers()
    } catch (err: any) {
      console.error('Error editing customer:', err)
      toast.showError(err.message || 'ไม่สามารถแก้ไขข้อมูลลูกค้าได้')
    }
  }

  const handleDeleteCustomer = async () => {
    try {
      const response = await fetch(`/api/customers/${selectedCustomer?.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'เกิดข้อผิดพลาด')
      }

      toast.showSuccess('ลบลูกค้าเรียบร้อยแล้ว')
      setShowDeleteModal(false)
      setSelectedCustomer(null)
      fetchCustomers()
    } catch (err: any) {
      console.error('Error deleting customer:', err)
      toast.showError(err.message || 'ไม่สามารถลบลูกค้าได้')
    }
  }

  const openEditModal = (customer: Customer) => {
    setSelectedCustomer(customer)
    setEditCustomer({
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      email: customer.email,
      phone: customer.phone || '',
      status: customer.status,
      segment: customer.segment,
      notes: customer.notes || ''
    })
    setShowEditModal(true)
  }

  const openDeleteModal = (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowDeleteModal(true)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(amount)
  }

  const formatDate = (date: Date | string | null) => {
    if (!date) return '-'
    const d = new Date(date)
    const day = d.getDate().toString().padStart(2, '0')
    const month = (d.getMonth() + 1).toString().padStart(2, '0')
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
  }

  if (!session) {
    return <div>กำลังโหลด...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">จัดการลูกค้า</h1>
          <p className="text-slate-600">จัดการข้อมูลลูกค้าและดูประวัติการซื้อสินค้า</p>
        </div>
        <Button leftIcon={Plus}>
          เพิ่มลูกค้าใหม่
        </Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <StatCard
            title="ลูกค้าทั้งหมด"
            value={summary.totalCustomers.toString()}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="ลูกค้าที่ใช้งาน"
            value={summary.activeCustomers.toString()}
            icon={UserCheck}
            color="green"
          />
          <StatCard
            title="ยืนยันแล้ว"
            value={summary.verifiedCustomers.toString()}
            icon={Star}
            color="blue"
          />
          <StatCard
            title="ลูกค้าใหม่เดือนนี้"
            value={summary.newThisMonth.toString()}
            icon={Calendar}
            color="purple"
          />
          <StatCard
            title="ยอดขายรวม"
            value={formatCurrency(summary.totalRevenue)}
            icon={Star}
            color="yellow"
          />
        </div>
      )}

      {/* Filters */}
      <Card className="p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="ค้นหาลูกค้า..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">สถานะทั้งหมด</option>
                <option value="active">ใช้งาน</option>
                <option value="inactive">ไม่ใช้งาน</option>
              </select>
            </div>
            <div>
              <select
                value={verifiedFilter}
                onChange={(e) => setVerifiedFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">การยืนยันทั้งหมด</option>
                <option value="true">ยืนยันแล้ว</option>
                <option value="false">ยังไม่ยืนยัน</option>
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
                <option value="name-asc">ชื่อ (A-Z)</option>
                <option value="name-desc">ชื่อ (Z-A)</option>
                <option value="totalSpent-desc">ยอดซื้อ (มาก-น้อย)</option>
                <option value="totalSpent-asc">ยอดซื้อ (น้อย-มาก)</option>
              </select>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <Button 
              variant="ghost" 
              onClick={clearFilters}
            >
              ล้างตัวกรอง
            </Button>
            <div className="flex space-x-2">
              <Button
                type="submit"
                leftIcon={Search}
              >
                ค้นหา
              </Button>
              <Button
                type="button"
                onClick={() => setShowCreateModal(true)}
                leftIcon={Plus}
                variant="outline"
              >
                เพิ่มลูกค้า
              </Button>
              <IconButton
                icon={Download}
                variant="outline"
                tooltip="ส่งออกข้อมูล"
              />
            </div>
          </div>
        </form>
      </Card>

      {/* Customers Table */}
      <Card>
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium">รายการลูกค้า</h3>
        </div>
        <EnhancedTable loading={loading}>
          <TableHeader>
            <TableRow>
              <TableHead>ลูกค้า</TableHead>
              <TableHead>ติดต่อ</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead>คำสั่งซื้อ</TableHead>
              <TableHead>ยอดซื้อ</TableHead>
              <TableHead>สมัครเมื่อ</TableHead>
              <TableHead>การดำเนินการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {getFullName(customer)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {customer.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-900">{customer.phone}</div>
                  <div className="text-sm text-gray-500">
                    {customer.segment}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col space-y-1">
                    <Badge
                      variant={
                        customer.status === 'ACTIVE' ? 'success' :
                        customer.status === 'INACTIVE' ? 'warning' : 'error'
                      }
                    >
                      {customer.status === 'ACTIVE' ? 'ใช้งาน' : 
                       customer.status === 'INACTIVE' ? 'ไม่ใช้งาน' : 'บัญชีดำ'}
                    </Badge>
                    <Badge
                      variant={
                        customer.segment === 'VIP' ? 'default' :
                        customer.segment === 'REGULAR' ? 'info' :
                        customer.segment === 'NEW' ? 'success' : 'error'
                      }
                    >
                      {customer.segment === 'VIP' ? 'VIP' : 
                       customer.segment === 'REGULAR' ? 'ทั่วไป' : 
                       customer.segment === 'NEW' ? 'ใหม่' : 'เสี่ยง'}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-900">{customer.totalOrders} คำสั่งซื้อ</div>
                  <div className="text-sm text-gray-500">
                    {customer.lastOrderAt ? `ล่าสุด: ${formatDate(customer.lastOrderAt)}` : 'ยังไม่มีคำสั่งซื้อ'}
                  </div>
                </TableCell>
                <TableCell className="text-sm font-medium text-gray-900">
                  {formatCurrency(customer.totalSpent)}
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {formatDate(customer.createdAt)}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <IconButton
                      icon={Eye}
                      variant="ghost"
                      size="sm"
                      tooltip="ดูรายละเอียด"
                      onClick={() => openCustomerModal(customer)}
                    />
                    <IconButton
                      icon={Edit}
                      variant="ghost"
                      size="sm"
                      tooltip="แก้ไข"
                      onClick={() => openEditModal(customer)}
                    />
                    <IconButton
                      icon={customer.status === 'ACTIVE' ? UserMinus : UserPlus}
                      variant="ghost"
                      size="sm"
                      tooltip={customer.status === 'ACTIVE' ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                      onClick={() => updateCustomerStatus(customer.id, customer.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
                      className={customer.status === 'ACTIVE' ? 'text-yellow-600 hover:text-yellow-700' : 'text-green-600 hover:text-green-700'}
                    />
                    <IconButton
                      icon={Trash2}
                      variant="ghost"
                      size="sm"
                      tooltip="ลบ"
                      onClick={() => openDeleteModal(customer)}
                      className="text-red-600 hover:text-red-700"
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </EnhancedTable>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={totalCustomers}
            itemsPerPage={10}
          />
        )}
      </Card>

      {/* Customer Detail Modal */}
      {showCustomerModal && selectedCustomer && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-2xl rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">รายละเอียดลูกค้า</h3>
              <button
                onClick={() => setShowCustomerModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">ชื่อ</label>
                  <p className="mt-1 text-sm text-gray-900">{getFullName(selectedCustomer)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">อีเมล</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedCustomer.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">เบอร์โทร</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedCustomer.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">วันเกิด</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedCustomer.birthDate ? formatDate(selectedCustomer.birthDate) : 'ไม่ระบุ'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">สถานะ</label>
                  <div className="mt-1 space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedCustomer.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800' 
                        : selectedCustomer.status === 'INACTIVE'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedCustomer.status === 'ACTIVE' ? 'ใช้งาน' : selectedCustomer.status === 'INACTIVE' ? 'ไม่ใช้งาน' : 'บัญชีดำ'}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedCustomer.segment === 'VIP'
                        ? 'bg-purple-100 text-purple-800' 
                        : selectedCustomer.segment === 'REGULAR'
                        ? 'bg-blue-100 text-blue-800'
                        : selectedCustomer.segment === 'NEW'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {selectedCustomer.segment === 'VIP' ? 'VIP' : selectedCustomer.segment === 'REGULAR' ? 'ทั่วไป' : selectedCustomer.segment === 'NEW' ? 'ใหม่' : 'เสี่ยง'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="border-t pt-4">
                <h4 className="text-md font-medium text-gray-900 mb-2">สถิติการซื้อสินค้า</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{selectedCustomer.totalOrders}</p>
                    <p className="text-sm text-gray-500">คำสั่งซื้อ</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedCustomer.totalSpent)}</p>
                    <p className="text-sm text-gray-500">ยอดซื้อรวม</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {selectedCustomer.totalOrders > 0 ? formatCurrency(selectedCustomer.totalSpent / selectedCustomer.totalOrders) : '฿0'}
                    </p>
                    <p className="text-sm text-gray-500">ยอดเฉลี่ย</p>
                  </div>
                </div>
              </div>

              {/* Addresses */}
              {selectedCustomer.addresses && selectedCustomer.addresses.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="text-md font-medium text-gray-900 mb-2">ที่อยู่</h4>
                  {selectedCustomer.addresses.map((address) => (
                    <div key={address.id} className="bg-gray-50 p-3 rounded-md">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{address.fullName}</p>
                          <p className="text-sm text-gray-600">{address.phone}</p>
                          <p className="text-sm text-gray-600">
                            {address.address}, {address.district}, {address.province} {address.postalCode}
                          </p>
                        </div>
                        {address.isDefault && (
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                            ค่าเริ่มต้น
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Notes */}
              {selectedCustomer.notes && (
                <div className="border-t pt-4">
                  <h4 className="text-md font-medium text-gray-900 mb-2">หมายเหตุ</h4>
                  <p className="text-sm text-gray-600">{selectedCustomer.notes}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowCustomerModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                ปิด
              </button>
              <button
                onClick={() => updateCustomerStatus(selectedCustomer.id, selectedCustomer.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
                className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
                  selectedCustomer.status === 'ACTIVE'
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {selectedCustomer.status === 'ACTIVE' ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl border">
            <h3 className="text-lg font-medium mb-4">แก้ไขข้อมูลลูกค้า</h3>
            <form onSubmit={async (e) => {
              e.preventDefault()
              await handleEditCustomer()
            }}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ</label>
                    <input
                      type="text"
                      value={editCustomer.firstName}
                      onChange={(e) => setEditCustomer({...editCustomer, firstName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">นามสกุล</label>
                    <input
                      type="text"
                      value={editCustomer.lastName}
                      onChange={(e) => setEditCustomer({...editCustomer, lastName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                  <input
                    type="email"
                    value={editCustomer.email}
                    onChange={(e) => setEditCustomer({...editCustomer, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">โทรศัพท์</label>
                  <input
                    type="tel"
                    value={editCustomer.phone}
                    onChange={(e) => setEditCustomer({...editCustomer, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                  <select
                    value={editCustomer.status}
                    onChange={(e) => setEditCustomer({...editCustomer, status: e.target.value as Customer['status']})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="ACTIVE">ใช้งาน</option>
                    <option value="INACTIVE">ไม่ใช้งาน</option>
                    <option value="BLACKLISTED">บัญชีดำ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ระดับลูกค้า</label>
                  <select
                    value={editCustomer.segment}
                    onChange={(e) => setEditCustomer({...editCustomer, segment: e.target.value as Customer['segment']})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="REGULAR">ทั่วไป</option>
                    <option value="VIP">VIP</option>
                    <option value="NEW">ใหม่</option>
                    <option value="AT_RISK">เสี่ยง</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ</label>
                  <textarea
                    value={editCustomer.notes}
                    onChange={(e) => setEditCustomer({...editCustomer, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    บันทึก
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl border">
            <h3 className="text-lg font-medium mb-4">ยืนยันการลบ</h3>
            <p className="text-gray-600 mb-6">
              คุณแน่ใจหรือไม่ที่ต้องการลบลูกค้า "{selectedCustomer ? getFullName(selectedCustomer) : ''}" 
              การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDeleteCustomer}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                ลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}