'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
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
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
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
      } else {
        console.error('Failed to update order status')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
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
      } else {
        console.error('Failed to delete order')
      }
    } catch (error) {
      console.error('Error deleting order:', error)
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
        icon: Clock
      },
      PROCESSING: { 
        label: 'กำลังจัดเตรียม', 
        color: 'bg-blue-100 text-blue-800',
        icon: Package
      },
      SHIPPED: { 
        label: 'จัดส่งแล้ว', 
        color: 'bg-purple-100 text-purple-800',
        icon: Truck
      },
      DELIVERED: { 
        label: 'ส่งมอบแล้ว', 
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle
      },
      CANCELLED: { 
        label: 'ยกเลิกแล้ว', 
        color: 'bg-red-100 text-red-800',
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
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            ส่งออกรายงาน
          </button>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm font-medium text-gray-500">คำสั่งซื้อทั้งหมด</div>
              <div className="text-2xl font-bold text-gray-900">{summary.totalOrders}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm font-medium text-gray-500">รอดำเนินการ</div>
              <div className="text-2xl font-bold text-yellow-600">{summary.pending}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm font-medium text-gray-500">กำลังจัดเตรียม</div>
              <div className="text-2xl font-bold text-blue-600">{summary.processing}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm font-medium text-gray-500">จัดส่งแล้ว</div>
              <div className="text-2xl font-bold text-purple-600">{summary.shipped}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm font-medium text-gray-500">ส่งมอบแล้ว</div>
              <div className="text-2xl font-bold text-green-600">{summary.delivered}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm font-medium text-gray-500">ยอดขายรวม</div>
              <div className="text-2xl font-bold text-indigo-600">
                {formatCurrency(summary.totalRevenue)}
              </div>
            </div>
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
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    คำสั่งซื้อ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ลูกค้า
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สถานะ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ยอดรวม
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    วันที่สั่งซื้อ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    การจัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => {
                  const statusConfig = getStatusConfig(order.status)
                  const StatusIcon = statusConfig.icon
                  
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {order.orderNumber}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.items.length} รายการ
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {getCustomerName(order)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {getCustomerEmail(order)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewOrder(order)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                              className="text-xs border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="PENDING">รอดำเนินการ</option>
                              <option value="PROCESSING">จัดเตรียม</option>
                              <option value="SHIPPED">จัดส่ง</option>
                              <option value="DELIVERED">ส่งมอบ</option>
                              <option value="CANCELLED">ยกเลิก</option>
                            </select>
                          )}
                          {(session?.user.role === 'ADMIN' || session?.user.role === 'SUPER_ADMIN') && (
                            <button
                              onClick={() => openDeleteModal(order)}
                              className="text-red-600 hover:text-red-900 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                หน้า {currentPage} จาก {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  ก่อนหน้า
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  ถัดไป
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Order Detail Modal */}
        {showModal && selectedOrder && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
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