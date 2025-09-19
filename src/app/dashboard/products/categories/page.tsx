'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useToastNotification } from '@/hooks/use-toast-notification'
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye,
  Folder,
  FolderOpen
} from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  description: string
  isActive: boolean
  parentId: string | null
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

export default function CategoriesPage() {
  const { data: session } = useSession()
  const toast = useToastNotification()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parentId: '',
    isActive: true
  })

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        includeInactive: 'true'
      })

      const response = await fetch(`/api/categories?${params}`)
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleAddCategory = () => {
    setEditingCategory(null)
    setFormData({
      name: '',
      slug: '',
      description: '',
      parentId: '',
      isActive: true
    })
    setShowModal(true)
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description,
      parentId: category.parentId || '',
      isActive: category.isActive
    })
    setShowModal(true)
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9ก-๙\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingCategory 
        ? `/api/categories/${editingCategory.id}` 
        : '/api/categories'
      
      const method = editingCategory ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          parentId: formData.parentId || null
        }),
      })

      if (response.ok) {
        fetchCategories()
        setShowModal(false)
        toast.showSuccess('บันทึกข้อมูลหมวดหมู่เรียบร้อยแล้ว')
      } else {
        const errorData = await response.json()
        toast.showError(errorData.error || 'เกิดข้อผิดพลาด')
      }
    } catch (error) {
      console.error('Error saving category:', error)
      toast.showError('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    }
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getParentCategories = () => {
    return categories.filter(cat => cat.parentId === null)
  }

  const getSubCategories = (parentId: string) => {
    return categories.filter(cat => cat.parentId === parentId)
  }

  const CategoryRow = ({ category, level = 0 }: { category: Category; level?: number }) => {
    const subCategories = getSubCategories(category.id)
    
    return (
      <>
        <tr className="hover:bg-gray-50">
          <td className="px-6 py-4">
            <div className={`flex items-center ${level > 0 ? `ml-${level * 6}` : ''}`}>
              {subCategories.length > 0 ? (
                <FolderOpen className="w-5 h-5 text-blue-500 mr-2" />
              ) : (
                <Folder className="w-5 h-5 text-gray-400 mr-2" />
              )}
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {category.name}
                </div>
                <div className="text-sm text-gray-500">
                  {category.slug}
                </div>
              </div>
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="text-sm text-gray-900">
              {category.description || '-'}
            </div>
          </td>
          <td className="px-6 py-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              category.isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {category.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
            </span>
          </td>
          <td className="px-6 py-4 text-right">
            <div className="flex items-center justify-end space-x-2">
              <button className="text-gray-400 hover:text-blue-600 p-1">
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleEditCategory(category)}
                className="text-gray-400 hover:text-blue-600 p-1"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              {session?.user.role === 'ADMIN' && (
                <button className="text-gray-400 hover:text-red-600 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </td>
        </tr>
        {subCategories.map((subCategory) => (
          <CategoryRow key={subCategory.id} category={subCategory} level={level + 1} />
        ))}
      </>
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
            <h1 className="text-2xl font-bold text-gray-900">จัดการหมวดหมู่</h1>
            <p className="text-gray-500">จัดการหมวดหมู่สินค้าและโครงสร้างการจัดกลุ่ม</p>
          </div>
          {session?.user.role === 'ADMIN' && (
            <button
              onClick={handleAddCategory}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              เพิ่มหมวดหมู่
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="ค้นหาหมวดหมู่..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Categories Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    หมวดหมู่
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    รายละเอียด
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สถานะ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    การจัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getParentCategories()
                  .filter(category =>
                    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    category.description.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((category) => (
                    <CategoryRow key={category.id} category={category} />
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-transparent backdrop-blur-sm overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-2xl rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingCategory ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ชื่อหมวดหมู่
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slug
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      รายละเอียด
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      หมวดหมู่หลัก
                    </label>
                    <select
                      value={formData.parentId}
                      onChange={(e) => setFormData(prev => ({ ...prev, parentId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">หมวดหมู่หลัก (ไม่มีหมวดหมู่แม่)</option>
                      {getParentCategories()
                        .filter(cat => !editingCategory || cat.id !== editingCategory.id)
                        .map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                      เปิดใช้งาน
                    </label>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      {editingCategory ? 'อัพเดท' : 'เพิ่ม'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}