'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Package,
  Search,
  Filter,
  Download,
  RefreshCw,
  BarChart3
} from 'lucide-react'

interface Product {
  id: string
  name: string
  sku: string
  stock: number
  lowStockThreshold: number
  price: number
  category?: {
    id: string
    name: string
    slug: string
  }
  brand?: {
    id: string
    name: string
    slug: string
  }
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK'
}

interface StockMovement {
  id: string
  productId: string
  type: 'IN' | 'OUT' | 'ADJUSTMENT'
  quantity: number
  reason: string
  date: string
  product: {
    name: string
    sku: string
  }
}

export default function InventoryPage() {
  const { data: session } = useSession()
  const [products, setProducts] = useState<Product[]>([])
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [stockFilter, setStockFilter] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  const fetchInventoryData = async () => {
    try {
      setLoading(true)
      
      // Fetch products with stock information
      const productsResponse = await fetch('/api/products')
      if (productsResponse.ok) {
        const productsData = await productsResponse.json()
        setProducts(productsData.products)
      }

      // Mock stock movements data (would come from API in real implementation)
      const mockMovements: StockMovement[] = [
        {
          id: '1',
          productId: '1',
          type: 'IN',
          quantity: 50,
          reason: 'สินค้าเข้าใหม่',
          date: new Date().toISOString(),
          product: { name: 'iPhone 15 Pro', sku: 'IP15-PRO-128' }
        },
        {
          id: '2',
          productId: '2',
          type: 'OUT',
          quantity: 25,
          reason: 'ขายแล้ว',
          date: new Date().toISOString(),
          product: { name: 'Samsung Galaxy S24', sku: 'SGS24-256' }
        },
        {
          id: '3',
          productId: '3',
          type: 'ADJUSTMENT',
          quantity: -5,
          reason: 'สินค้าเสียหาย',
          date: new Date().toISOString(),
          product: { name: 'MacBook Pro 14"', sku: 'MBP14-M3-512' }
        }
      ]
      setStockMovements(mockMovements)
      
    } catch (error) {
      console.error('Error fetching inventory data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500) // Wait 500ms after user stops typing

    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    fetchInventoryData()
  }, [])

  const getStockStatus = (product: Product) => {
    if (product.stock <= 0) return 'out-of-stock'
    if (product.stock <= product.lowStockThreshold) return 'low-stock'
    return 'in-stock'
  }

  const getFilteredProducts = () => {
    let filtered = products.filter(product =>
      product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    )

    if (stockFilter) {
      filtered = filtered.filter(product => {
        const status = getStockStatus(product)
        return status === stockFilter
      })
    }

    return filtered
  }

  const getInventoryStats = () => {
    const totalProducts = products.length
    const inStock = products.filter(p => p.stock > p.lowStockThreshold).length
    const lowStock = products.filter(p => p.stock <= p.lowStockThreshold && p.stock > 0).length
    const outOfStock = products.filter(p => p.stock <= 0).length
    const totalValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0)

    return { totalProducts, inStock, lowStock, outOfStock, totalValue }
  }

  const stats = getInventoryStats()

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
            <h1 className="text-2xl font-bold text-gray-900">จัดการสินค้าคงคลัง</h1>
            <p className="text-gray-500">ติดตามและจัดการสต็อกสินค้าในระบบ</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchInventoryData}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              รีเฟรช
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              ส่งออกข้อมูล
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">สินค้าทั้งหมด</div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalProducts}</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">สินค้าปกติ</div>
                <div className="text-2xl font-bold text-green-600">{stats.inStock}</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">สต็อกต่ำ</div>
                <div className="text-2xl font-bold text-yellow-600">{stats.lowStock}</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingDown className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">หมดสต็อก</div>
                <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">มูลค่าสต็อก</div>
                <div className="text-2xl font-bold text-purple-600">
                  ฿{stats.totalValue.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                ภาพรวมสต็อก
              </button>
              <button
                onClick={() => setActiveTab('movements')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'movements'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                การเคลื่อนไหวสต็อก
              </button>
            </nav>
          </div>

          {activeTab === 'overview' && (
            <div className="p-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="ค้นหาสินค้า..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="sm:w-48">
                  <select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">สถานะทั้งหมด</option>
                    <option value="in-stock">สต็อกปกติ</option>
                    <option value="low-stock">สต็อกต่ำ</option>
                    <option value="out-of-stock">หมดสต็อก</option>
                  </select>
                </div>
              </div>

              {/* Products Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        สินค้า
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SKU
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        หมวดหมู่
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        สต็อกปัจจุบัน
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ราคา
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        สถานะ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        มูลค่า
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getFilteredProducts().map((product) => {
                      const stockStatus = getStockStatus(product)
                      return (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {product.brand?.name || 'ไม่ระบุแบรนด์'}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {product.sku}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {product.category?.name || 'ไม่ระบุหมวดหมู่'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.stock} หน่วย
                            </div>
                            <div className="text-xs text-gray-500">
                              ขั้นต่ำ: {product.lowStockThreshold}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            ฿{product.price.toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              stockStatus === 'in-stock'
                                ? 'bg-green-100 text-green-800'
                                : stockStatus === 'low-stock'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {stockStatus === 'in-stock' && 'สต็อกปกติ'}
                              {stockStatus === 'low-stock' && 'สต็อกต่ำ'}
                              {stockStatus === 'out-of-stock' && 'หมดสต็อก'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            ฿{(product.stock * product.price).toLocaleString()}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'movements' && (
            <div className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">การเคลื่อนไหวสต็อกล่าสุด</h3>
                
                <div className="space-y-3">
                  {stockMovements.map((movement) => (
                    <div key={movement.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-3 ${
                            movement.type === 'IN' 
                              ? 'bg-green-500' 
                              : movement.type === 'OUT' 
                              ? 'bg-red-500' 
                              : 'bg-yellow-500'
                          }`} />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {movement.product.name} ({movement.product.sku})
                            </div>
                            <div className="text-xs text-gray-500">
                              {movement.reason}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${
                            movement.type === 'IN' 
                              ? 'text-green-600' 
                              : movement.type === 'OUT' 
                              ? 'text-red-600' 
                              : 'text-yellow-600'
                          }`}>
                            {movement.type === 'IN' ? '+' : movement.type === 'OUT' ? '-' : ''}{Math.abs(movement.quantity)} หน่วย
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(movement.date).toLocaleDateString('th-TH')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}