'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useToastNotification } from '@/hooks/use-toast-notification'
import { 
  Search, 
  Filter, 
  Calendar,
  Eye,
  Edit,
  Truck,
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
  Trash2,
  DollarSign,
  ShoppingCart,
  Phone,
  Mail,
  MapPin,
  Download
} from 'lucide-react'
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

// Types
type OrderStatus = 'PENDING' | 'PAID' | 'PACKED' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED'

interface Order {
  id: string
  orderNumber: string
  customer: {
    id: string
    firstName: string
    lastName: string
    email: string
  } | null
  customerEmail: string
  status: 'PENDING' | 'PAID' | 'PACKED' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED'
  total: number
  subtotal: number
  tax: number
  shipping: number
  shippingAddress: any
  billingAddress?: any
  items: Array<{
    id: string
    product: {
      id: string
      name: string
      sku: string
      price: number
    }
    quantity: number
    price: number
    total: number
  }>
  itemCount: number
  createdAt: string
  updatedAt: string
}

interface OrderSummary {
  totalOrders: number
  pending: number
  processing: number
  shipped: number
  delivered: number
  cancelled: number
  totalRevenue: number
}

// Helper functions
const getCustomerName = (order: Order): string => {
  if (!order.customer) return order.customerEmail || 'ไม่ระบุ'
  const fullName = `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim()
  return fullName || order.customer.email || 'ไม่ระบุ'
}

const getCustomerEmail = (order: Order): string => {
  return order.customer?.email || order.customerEmail || 'ไม่ระบุ'
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB'
  }).format(amount)
}

export default function OrdersPage() {
  const { data: session } = useSession()
  const toast = useToastNotification()
  const [orders, setOrders] = useState<Order[]>([])
  const [summary, setSummary] = useState<OrderSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(dateRange.start && { startDate: dateRange.start }),
        ...(dateRange.end && { endDate: dateRange.end })
      })

      const response = await fetch(`/api/orders?${params}`)
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)
        setSummary(data.summary)
        setTotalPages(data.pagination.totalPages)
      } else {
        toast.showError('ไม่สามารถโหลดข้อมูลคำสั่งซื้อได้')
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.showError('เกิดข้อผิดพลาดในการโหลดข้อมูล')
    } finally {
      setLoading(false)
    }
  }

  // CRUD Operations
  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        await fetchOrders() // Refresh orders list
        setSelectedOrder(null)
        setShowModal(false)
        toast.showSuccess('อัปเดตสถานะคำสั่งซื้อเรียบร้อยแล้ว')
      } else {
        console.error('Failed to update order status')
        toast.showError('ไม่สามารถอัปเดตสถานะคำสั่งซื้อได้')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.showError('เกิดข้อผิดพลาดในการอัปเดตสถานะ')
    }
  }

  const deleteOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchOrders() // Refresh orders list
        setSelectedOrder(null)
        setShowDeleteModal(false)
        toast.showSuccess('ลบคำสั่งซื้อเรียบร้อยแล้ว')
      } else {
        console.error('Failed to delete order')
        toast.showError('ไม่สามารถลบคำสั่งซื้อได้')
      }
    } catch (error) {
      console.error('Error deleting order:', error)
      toast.showError('เกิดข้อผิดพลาดในการลบคำสั่งซื้อ')
    }
  }

  // Helper functions for UI interactions
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    updateOrderStatus(orderId, newStatus as OrderStatus)
  }

  const openDeleteModal = (order: Order) => {
    setSelectedOrder(order)
    setShowDeleteModal(true)
  }

  const handleDeleteOrder = async () => {
    if (selectedOrder) {
      await deleteOrder(selectedOrder.id)
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

  // Format functions to prevent hydration errors
  const formatCurrency = (amount: number | null | undefined) => {
    if (amount == null) return '฿0.00'
    return `฿${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`
  }

  const formatDate = (date: string | Date) => {
    const d = new Date(date)
    const day = d.getDate().toString().padStart(2, '0')
    const month = (d.getMonth() + 1).toString().padStart(2, '0')
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
  }

  useEffect(() => {
    fetchOrders()
  }, [currentPage, debouncedSearchTerm, statusFilter, dateRange])

  const getStatusConfig = (status: string) => {
    const configs = {
      PENDING: { 
        label: 'รอดำเนินการ', 
        color: 'bg-yellow-100 text-yellow-800',
        variant: 'warning' as const,
        icon: Clock
      },
      PROCESSING: { 
        label: 'กำลังจัดเตรียม', 
        color: 'bg-blue-100 text-blue-800',
        variant: 'info' as const,
        icon: Package
      },
      SHIPPED: { 
        label: 'จัดส่งแล้ว', 
        color: 'bg-purple-100 text-purple-800',
        variant: 'secondary' as const,
        icon: Truck
      },
      DELIVERED: { 
        label: 'ส่งมอบแล้ว', 
        color: 'bg-green-100 text-green-800',
        variant: 'success' as const,
        icon: CheckCircle
      },
      CANCELLED: { 
        label: 'ยกเลิกแล้ว', 
        color: 'bg-red-100 text-red-800',
        variant: 'error' as const,
        icon: AlertCircle
      }
    }
    return configs[status as keyof typeof configs] || configs.PENDING
  }

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setShowModal(true)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">จัดการคำสั่งซื้อ</h1>
            <p className="text-gray-500">ติดตามและจัดการคำสั่งซื้อทั้งหมด</p>
          </div>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            ส่งออกรายงาน
          </Button>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
            <StatCard
              title="คำสั่งซื้อทั้งหมด"
              value={summary.totalOrders.toString()}
              icon={ShoppingCart}
              color="blue"
            />
            <StatCard
              title="รอดำเนินการ"
              value={summary.pending.toString()}
              icon={Clock}
              color="yellow"
            />
            <StatCard
              title="กำลังจัดเตรียม"
              value={summary.processing.toString()}
              icon={Package}
              color="purple"
            />
            <StatCard
              title="จัดส่งแล้ว"
              value={summary.shipped.toString()}
              icon={Truck}
              color="blue"
            />
            <StatCard
              title="ส่งมอบแล้ว"
              value={summary.delivered.toString()}
              icon={CheckCircle}
              color="green"
            />
            <StatCard
              title="ยอดขายรวม"
              value={formatCurrency(summary.totalRevenue)}
              icon={DollarSign}
              color="green"
            />
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="ค้นหาเลขที่คำสั่งซื้อ, ชื่อลูกค้า, อีเมล..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="lg:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">สถานะทั้งหมด</option>
                  <option value="PENDING">รอดำเนินการ</option>
                  <option value="PROCESSING">กำลังจัดเตรียม</option>
                  <option value="SHIPPED">จัดส่งแล้ว</option>
                  <option value="DELIVERED">ส่งมอบแล้ว</option>
                  <option value="CANCELLED">ยกเลิกแล้ว</option>
                </select>
              </div>
              <div className="lg:w-48">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="lg:w-48">
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <EnhancedTable loading={loading}>
            <TableHeader>
              <TableRow>
                <TableHead sortable>คำสั่งซื้อ</TableHead>
                <TableHead>ลูกค้า</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead sortable>ยอดรวม</TableHead>
                <TableHead sortable>วันที่สั่งซื้อ</TableHead>
                <TableHead className="text-right">การจัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const statusConfig = getStatusConfig(order.status)
                const StatusIcon = statusConfig.icon
                
                return (
                  <TableRow key={order.id} clickable>
                    <TableCell>
                      <div className="text-sm font-semibold text-slate-900">
                        {order.orderNumber}
                      </div>
                      <div className="text-xs text-slate-500">
                        {order.items.length} รายการ
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-semibold text-slate-900">
                        {getCustomerName(order)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {getCustomerEmail(order)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig.variant} className="gap-1">
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(order.total)}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end space-x-1">
                        <IconButton
                          size="sm"
                          variant="ghost"
                          icon={Eye}
                          onClick={() => handleViewOrder(order)}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        />
                        {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                            className="text-xs border border-slate-300 rounded-md px-2 py-1 hover:border-slate-400 focus:border-blue-500 focus:outline-none transition-colors"
                          >
                            <option value="PENDING">รอดำเนินการ</option>
                            <option value="PROCESSING">จัดเตรียม</option>
                            <option value="SHIPPED">จัดส่ง</option>
                            <option value="DELIVERED">ส่งมอบ</option>
                            <option value="CANCELLED">ยกเลิก</option>
                          </select>
                        )}
                        {(session?.user.role === 'ADMIN' || session?.user.role === 'SUPER_ADMIN') && (
                          <IconButton
                            size="sm"
                            variant="ghost"
                            icon={Trash2}
                            onClick={() => openDeleteModal(order)}
                            className="hover:bg-red-50 hover:text-red-600"
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </EnhancedTable>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={summary?.totalOrders || 0}
            itemsPerPage={10}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* Order Detail Modal */}
        {showModal && selectedOrder && (
          <div className="fixed inset-0 bg-transparent backdrop-blur-sm overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-2xl rounded-md bg-white">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  รายละเอียดคำสั่งซื้อ {selectedOrder.orderNumber}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Customer Info */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">ข้อมูลลูกค้า</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex items-center">
                      <span className="font-medium">ชื่อ:</span>
                      <span className="ml-2">{getCustomerName(selectedOrder)}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      <span>{getCustomerEmail(selectedOrder)}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      <span>{selectedOrder.customer?.firstName || 'ไม่ระบุ'}</span>
                    </div>
                  </div>

                  <h4 className="font-medium text-gray-900 mt-6">ที่อยู่จัดส่ง</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start">
                      <MapPin className="w-4 h-4 mr-2 mt-1 text-gray-500" />
                      <div>
                        <div>{selectedOrder.shippingAddress.fullName}</div>
                        <div>{selectedOrder.shippingAddress.phone}</div>
                        <div>{selectedOrder.shippingAddress.address}</div>
                        <div>
                          {selectedOrder.shippingAddress.district} {selectedOrder.shippingAddress.province} {selectedOrder.shippingAddress.postalCode}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">รายการสินค้า</h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{item.product.name}</div>
                          <div className="text-sm text-gray-500">SKU: {item.product.sku}</div>
                          <div className="text-sm">จำนวน: {item.quantity}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(item.total)}</div>
                          <div className="text-sm text-gray-500">{formatCurrency(item.price)} × {item.quantity}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>ค่าขนส่ง:</span>
                      <span>{formatCurrency(selectedOrder.shipping)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>รวมทั้งหมด:</span>
                      <span>{formatCurrency(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedOrder.customerEmail && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900">หมายเหตุ</h4>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    หมายเหตุเพิ่มเติม: {selectedOrder.customerEmail}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl border">
              <h3 className="text-lg font-medium mb-4">ยืนยันการลบ</h3>
              <p className="text-gray-600 mb-6">
                คุณแน่ใจหรือไม่ที่ต้องการลบคำสั่งซื้อ #{selectedOrder?.orderNumber} 
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
                  onClick={handleDeleteOrder}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                >
                  ลบ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}