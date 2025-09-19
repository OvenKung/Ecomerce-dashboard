'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useToastNotification } from '@/hooks/use-toast-notification'
import { 
  Search, 
  Plus, 
  Filter, 
  Eye, 
  Edit2, 
  Trash2, 
  Download,
  Upload,
  Package,
  AlertTriangle,
  MoreHorizontal,
  Star
} from 'lucide-react'
import { Button, IconButton } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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

interface Product {
  id: string
  name: string
  description: string
  price: number
  comparePrice?: number
  sku: string
  barcode: string
  trackQuantity: boolean
  quantity: number
  categoryId: string
  brandId: string
  status: string
  images: string[]
  createdAt: string
  updatedAt: string
}

interface ProductsResponse {
  products: Product[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export default function ProductsPage() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const toast = useToastNotification()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showEditModal, setShowEditModal] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false) // true = แก้ไข, false = เพิ่มใหม่
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [editProduct, setEditProduct] = useState({
    name: '',
    description: '',
    price: 0,
    comparePrice: 0,
    sku: '',
    barcode: '',
    trackQuantity: true,
    quantity: 0,
    categoryId: '',
    brandId: '',
    status: 'ACTIVE'
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: debouncedSearchTerm,
      })

      const response = await fetch(`/api/products?${params}`)
      if (response.ok) {
        const data: ProductsResponse = await response.json()
        setProducts(data.products)
        setPagination(data.pagination)
      } else {
        toast.showError('ไม่สามารถโหลดข้อมูลสินค้าได้')
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.showError('เกิดข้อผิดพลาดในการโหลดข้อมูล')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProduct = async () => {
    try {
      const url = isEditMode ? `/api/products/${selectedProduct?.id}` : '/api/products'
      const method = isEditMode ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editProduct),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'เกิดข้อผิดพลาด')
      }

      toast.showSuccess(
        isEditMode ? 'แก้ไขข้อมูลสินค้าเรียบร้อยแล้ว' : 'เพิ่มสินค้าใหม่เรียบร้อยแล้ว'
      )
      setShowEditModal(false)
      setSelectedProduct(null)
      setIsEditMode(false)
      setEditProduct({
        name: '',
        description: '',
        price: 0,
        comparePrice: 0,
        sku: '',
        barcode: '',
        trackQuantity: true,
        quantity: 0,
        categoryId: '',
        brandId: '',
        status: 'ACTIVE'
      })
      fetchProducts()
    } catch (err: any) {
      console.error('Error saving product:', err)
      toast.showError(err.message || 'ไม่สามารถบันทึกข้อมูลสินค้าได้')
    }
  }

  const handleDeleteProduct = async () => {
    try {
      const response = await fetch(`/api/products/${selectedProduct?.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'เกิดข้อผิดพลาด')
      }

      toast.showSuccess('ลบสินค้าเรียบร้อยแล้ว')
      setShowDeleteModal(false)
      setSelectedProduct(null)
      fetchProducts()
    } catch (err: any) {
      console.error('Error deleting product:', err)
      toast.showError(err.message || 'ไม่สามารถลบสินค้าได้')
    }
  }

  const openEditModal = (product: Product) => {
    setSelectedProduct(product)
    setIsEditMode(true)
    setEditProduct({
      name: product.name,
      description: product.description,
      price: product.price,
      comparePrice: product.comparePrice || 0,
      sku: product.sku,
      barcode: product.barcode,
      trackQuantity: product.trackQuantity,
      quantity: product.quantity,
      categoryId: product.categoryId,
      brandId: product.brandId,
      status: product.status
    })
    setShowEditModal(true)
  }

  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product)
    setShowDeleteModal(true)
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
    fetchProducts()
  }, [currentPage, debouncedSearchTerm])

  // Check for action parameter to auto-open create modal
  useEffect(() => {
    const action = searchParams.get('action')
    if (action === 'create') {
      setShowEditModal(true)
    }
  }, [searchParams])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(price)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { label: 'เผยแพร่', variant: 'success' as const },
      DRAFT: { label: 'ร่าง', variant: 'warning' as const },
      ARCHIVED: { label: 'ปิดการขาย', variant: 'error' as const }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT
    
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    )
  }

  const getStockStatus = (quantity: number, trackQuantity: boolean) => {
    if (!trackQuantity) {
      return <span className="text-slate-500 text-sm font-medium">ไม่ติดตาม</span>
    }
    
    if (quantity === 0) {
      return (
        <Badge variant="error" className="gap-1">
          <AlertTriangle className="w-3 h-3" />
          หมดสต็อก
        </Badge>
      )
    }
    
    if (quantity <= 5) {
      return (
        <Badge variant="warning" className="gap-1">
          <AlertTriangle className="w-3 h-3" />
          สต็อกต่ำ ({quantity})
        </Badge>
      )
    }
    
    return (
      <Badge variant="success">
        มีสต็อก ({quantity})
      </Badge>
    )
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
            <h1 className="text-2xl font-bold text-gray-900">จัดการสินค้า</h1>
            <p className="text-gray-600 mt-1">จัดการและติดตามสินค้าทั้งหมดในระบบ</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              นำเข้า
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              ส่งออก
            </Button>
            <Link href="/dashboard/products/add">
              <Button leftIcon={Plus}>
                เพิ่มสินค้าใหม่
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="ค้นหาด้วยชื่อสินค้า, SKU หรือรายละเอียด..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                ตัวกรอง
              </Button>
            </div>
          </div>

          {/* Products Table */}
          <EnhancedTable loading={loading}>
            <TableHeader>
              <TableRow>
                <TableHead sortable sortDirection="asc">สินค้า</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead sortable>สต็อก</TableHead>
                <TableHead sortable>ราคา</TableHead>
                <TableHead className="text-right">การจัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id} clickable>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shadow-sm">
                          <Package className="h-6 w-6 text-slate-500" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-slate-900">
                          {product.name}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          SKU: {product.sku}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(product.status)}
                  </TableCell>
                  <TableCell>
                    {getStockStatus(product.quantity, product.trackQuantity)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-semibold text-slate-900">
                      {formatPrice(product.price)}
                    </div>
                    {product.comparePrice && product.comparePrice > product.price && (
                      <div className="text-xs text-slate-500 line-through">
                        {formatPrice(product.comparePrice)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end space-x-1">
                      <IconButton 
                        size="sm" 
                        variant="ghost"
                        icon={Eye}
                        className="hover:bg-blue-50 hover:text-blue-600"
                      />
                      <IconButton 
                        size="sm"
                        variant="ghost"
                        icon={Edit2}
                        onClick={() => openEditModal(product)}
                        className="hover:bg-amber-50 hover:text-amber-600"
                      />
                      {session?.user.role === 'ADMIN' && (
                        <IconButton 
                          size="sm"
                          variant="ghost"
                          icon={Trash2}
                          onClick={() => openDeleteModal(product)}
                          className="hover:bg-red-50 hover:text-red-600"
                        />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </EnhancedTable>

          {/* Pagination */}
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
            onPageChange={setCurrentPage}
          />
        </Card>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border">
            <h3 className="text-lg font-medium mb-4">
              {isEditMode ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
            </h3>
            <form onSubmit={async (e) => {
              e.preventDefault()
              await handleSaveProduct()
            }}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อสินค้า</label>
                  <input
                    type="text"
                    value={editProduct.name}
                    onChange={(e) => setEditProduct({...editProduct, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input
                    type="text"
                    value={editProduct.sku}
                    onChange={(e) => setEditProduct({...editProduct, sku: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">คำอธิบาย</label>
                  <textarea
                    value={editProduct.description}
                    onChange={(e) => setEditProduct({...editProduct, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ราคา (บาท)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editProduct.price}
                    onChange={(e) => setEditProduct({...editProduct, price: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ราคาเปรียบเทียบ (บาท)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editProduct.comparePrice}
                    onChange={(e) => setEditProduct({...editProduct, comparePrice: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">จำนวนคงเหลือ</label>
                  <input
                    type="number"
                    value={editProduct.quantity}
                    onChange={(e) => setEditProduct({...editProduct, quantity: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                  <select
                    value={editProduct.status}
                    onChange={(e) => setEditProduct({...editProduct, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="ACTIVE">เปิดใช้งาน</option>
                    <option value="INACTIVE">ปิดใช้งาน</option>
                    <option value="DRAFT">แบบร่าง</option>
                  </select>
                </div>
                
                <div className="col-span-2 flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1"
                  >
                    ยกเลิก
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                  >
                    {isEditMode ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}
                  </Button>
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
              คุณแน่ใจหรือไม่ที่ต้องการลบสินค้า "{selectedProduct?.name}" 
              การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </p>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1"
              >
                ยกเลิก
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteProduct}
                className="flex-1"
              >
                ลบ
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}