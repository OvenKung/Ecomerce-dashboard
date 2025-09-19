'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useToastNotification } from '@/hooks/use-toast-notification'
import { usePermission } from '@/hooks/use-permission'
import { PermissionGuard, PermissionButton } from '@/components/permission/PermissionGuard'
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
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  User, 
  Users, 
  UserCheck, 
  Shield, 
  Activity,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface User {
  id: string
  name: string | null
  email: string
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'STAFF' | 'VIEWER'
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  lastLoginAt: string | null
  createdAt: string
  _count: {
    auditLogs: number
    createdOrders: number
  }
}

interface UsersResponse {
  users: User[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const ROLE_LABELS = {
  SUPER_ADMIN: 'ผู้ดูแลระบบสูงสุด',
  ADMIN: 'ผู้ดูแลระบบ',
  MANAGER: 'ผู้จัดการ', 
  STAFF: 'พนักงาน',
  VIEWER: 'ผู้อ่าน'
}

const STATUS_LABELS = {
  ACTIVE: 'ใช้งาน',
  INACTIVE: 'ไม่ใช้งาน',
  SUSPENDED: 'ระงับการใช้งาน'
}

const ROLE_COLORS = {
  SUPER_ADMIN: 'bg-purple-100 text-purple-800',
  ADMIN: 'bg-red-100 text-red-800',
  MANAGER: 'bg-blue-100 text-blue-800',
  STAFF: 'bg-green-100 text-green-800',
  VIEWER: 'bg-gray-100 text-gray-800'
}

const STATUS_COLORS = {
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-gray-100 text-gray-800',
  SUSPENDED: 'bg-red-100 text-red-800'
}

export default function UsersPage() {
  const { data: session } = useSession()
  const toast = useToastNotification()
  const { hasPermission, executeWithPermission } = usePermission()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  })

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'VIEWER' as const,
    status: 'ACTIVE' as const
  })
  const [editUser, setEditUser] = useState({
    name: '',
    email: '',
    role: 'VIEWER' as User['role'],
    status: 'ACTIVE' as User['status']
  })

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: debouncedSearchTerm,
        role: filterRole,
        status: filterStatus
      })

      const response = await fetch(`/api/users?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }

      const data: UsersResponse = await response.json()
      setUsers(data.users)
      setPagination(data.pagination)
    } catch (err) {
      const errorMessage = 'ไม่สามารถโหลดข้อมูลผู้ใช้งานได้'
      setError(errorMessage)
      toast.showError(errorMessage)
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  // Format date to prevent hydration errors
  const formatDate = (date: string | Date) => {
    const d = new Date(date)
    const day = d.getDate().toString().padStart(2, '0')
    const month = (d.getMonth() + 1).toString().padStart(2, '0')
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    await executeWithPermission('USERS', 'CREATE', async () => {
      try {
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newUser),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || errorData.error || 'Failed to create user')
        }

        const result = await response.json()
        toast.showSuccess('สร้างผู้ใช้งานใหม่เรียบร้อยแล้ว')
        
        setShowCreateModal(false)
        setNewUser({
          name: '',
          email: '',
          password: '',
          role: 'VIEWER',
          status: 'ACTIVE'
        })
        fetchUsers()
      } catch (err: any) {
        const errorMessage = err.message || 'ไม่สามารถสร้างผู้ใช้งานได้'
        setError(errorMessage)
        toast.showError(errorMessage)
      }
    })
  }

  const handleEditUser = async () => {
    await executeWithPermission('USERS', 'UPDATE', async () => {
      try {
        const response = await fetch(`/api/users/${selectedUser?.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editUser),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || error.error || 'เกิดข้อผิดพลาด')
        }

        const result = await response.json()
        toast.showSuccess('แก้ไขข้อมูลผู้ใช้งานเรียบร้อยแล้ว')

        setShowEditModal(false)
        setSelectedUser(null)
        setEditUser({
          name: '',
          email: '',
          role: 'VIEWER',
          status: 'ACTIVE'
        })
        fetchUsers()
      } catch (err: any) {
        const errorMessage = err.message || 'ไม่สามารถแก้ไขผู้ใช้งานได้'
        setError(errorMessage)
        toast.showError(errorMessage)
      }
    })
  }

  const handleDeleteUser = async () => {
    await executeWithPermission('USERS', 'DELETE', async () => {
      try {
        const response = await fetch(`/api/users/${selectedUser?.id}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || error.error || 'เกิดข้อผิดพลาด')
        }

        const result = await response.json()
        toast.showSuccess('ลบผู้ใช้งานเรียบร้อยแล้ว')

        setShowDeleteModal(false)
        setSelectedUser(null)
        fetchUsers()
      } catch (err: any) {
        const errorMessage = err.message || 'ไม่สามารถลบผู้ใช้งานได้'
        setError(errorMessage)
        toast.showError(errorMessage)
      }
    })
  }

  const openEditModal = (user: User) => {
    setSelectedUser(user)
    setEditUser({
      name: user.name || '',
      email: user.email,
      role: user.role,
      status: user.status
    })
    setShowEditModal(true)
  }

  const openDeleteModal = (user: User) => {
    setSelectedUser(user)
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
    fetchUsers()
  }, [currentPage, debouncedSearchTerm, filterRole, filterStatus])

  if (loading && users.length === 0) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <PermissionGuard resource="USERS" action="READ" showMessage={true}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              การจัดการผู้ใช้งาน 👥
            </h1>
            <p className="text-base sm:text-lg text-slate-600 font-medium max-w-2xl mx-auto">
              จัดการบัญชีผู้ใช้งานและสิทธิ์การเข้าถึง
            </p>
            <div className="mt-4 w-16 sm:w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto rounded-full"></div>
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <PermissionGuard resource="USERS" action="CREATE">
              <Button
                onClick={() => setShowCreateModal(true)}
                leftIcon={Plus}
                variant="default"
                size="lg"
                className="shadow-lg hover:shadow-xl transition-all duration-300"
              >
                เพิ่มผู้ใช้งาน
              </Button>
            </PermissionGuard>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              title="ผู้ใช้งานทั้งหมด"
              value={pagination.total.toString()}
              trend={{
                value: users.filter(u => {
                  const createdDate = new Date(u.createdAt)
                  const lastMonth = new Date()
                  lastMonth.setMonth(lastMonth.getMonth() - 1)
                  return createdDate > lastMonth
                }).length,
                isPositive: true,
                period: 'vs last month'
              }}
              icon={Users}
              color="blue"
              className="animate-slide-in-up"
              style={{ animationDelay: '0.1s' }}
            />
            <StatCard
              title="ผู้ใช้งานที่ใช้งาน"
              value={users.filter(u => u.status === 'ACTIVE').length.toString()}
              trend={{
                value: Math.round((users.filter(u => u.status === 'ACTIVE').length / pagination.total) * 100),
                isPositive: true,
                period: 'active rate'
              }}
              icon={UserCheck}
              color="green"
              className="animate-slide-in-up"
              style={{ animationDelay: '0.2s' }}
            />
            <StatCard
              title="ผู้ดูแลระบบ"
              value={users.filter(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length.toString()}
              trend={{
                value: Math.round((users.filter(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length / pagination.total) * 100),
                isPositive: true,
                period: 'admin ratio'
              }}
              icon={Shield}
              color="purple"
              className="animate-slide-in-up"
              style={{ animationDelay: '0.3s' }}
            />
            <StatCard
              title="ผู้ใช้งานใหม่"
              value={users.filter(u => {
                const createdDate = new Date(u.createdAt)
                const lastWeek = new Date()
                lastWeek.setDate(lastWeek.getDate() - 7)
                return createdDate > lastWeek
              }).length.toString()}
              trend={{
                value: 15,
                isPositive: true,
                period: 'this week'
              }}
              icon={Activity}
              color="red"
              className="animate-slide-in-up"
              style={{ animationDelay: '0.4s' }}
            />
          </div>

          {/* Filters */}
          <Card variant="glass" className="overflow-hidden">
            <div className="px-6 py-6 sm:px-8 sm:py-8">
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="w-2 h-6 sm:h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full mr-3 sm:mr-4"></div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  ตัวกรองข้อมูล 🔍
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    ค้นหา
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="ชื่อ หรือ อีเมล"
                      className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl text-sm bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    บทบาท
                  </label>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  >
                    <option value="">ทั้งหมด</option>
                    {Object.entries(ROLE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    สถานะ
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  >
                    <option value="">ทั้งหมด</option>
                    {Object.entries(STATUS_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    className="w-full rounded-xl border-slate-200 hover:bg-slate-50 transition-all duration-300"
                    onClick={() => {
                      setSearchTerm('')
                      setFilterRole('')
                      setFilterStatus('')
                      setCurrentPage(1)
                    }}
                  >
                    ล้างตัวกรอง
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Error Alert */}
          {error && (
            <Card variant="glass" className="border-red-200 bg-red-50/80 backdrop-blur-sm">
              <div className="px-6 py-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                  <button
                    onClick={() => setError('')}
                    className="ml-4 text-red-400 hover:text-red-600 transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </Card>
          )}

          {/* Users Table */}
          <Card variant="glass" className="overflow-hidden">
            <div className="px-6 py-6 sm:px-8 sm:py-8 border-b border-slate-200/60">
              <div className="flex items-center">
                <div className="w-2 h-6 sm:h-8 bg-gradient-to-b from-emerald-500 to-green-600 rounded-full mr-3 sm:mr-4"></div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  รายการผู้ใช้งาน ({pagination.total} คน) 👥
                </h3>
              </div>
            </div>
            <div className="bg-gradient-to-br from-slate-50/90 via-white/90 to-slate-50/90 backdrop-blur-sm">
              <EnhancedTable loading={loading}>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-slate-700 font-semibold">ผู้ใช้งาน</TableHead>
                    <TableHead className="text-slate-700 font-semibold">บทบาท</TableHead>
                    <TableHead className="text-slate-700 font-semibold">สถานะ</TableHead>
                    <TableHead className="text-slate-700 font-semibold">กิจกรรม</TableHead>
                    <TableHead className="text-slate-700 font-semibold">เข้าร่วมเมื่อ</TableHead>
                    <TableHead className="text-right text-slate-700 font-semibold">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className="hover:bg-slate-50/50 transition-colors duration-200">
                      <TableCell>
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg">
                              <span className="text-white font-semibold text-sm">
                                {user.name?.charAt(0)?.toUpperCase() || '?'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900">
                              {user.name || 'ไม่ระบุชื่อ'}
                            </div>
                            <div className="text-sm text-slate-500">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' ? 'error' :
                            user.role === 'MANAGER' ? 'info' :
                            user.role === 'STAFF' ? 'success' : 'secondary'
                          }
                          className="shadow-sm"
                        >
                          {user.role === 'SUPER_ADMIN' ? '👑 Super Admin' :
                           user.role === 'ADMIN' ? '🛡️ Admin' :
                           user.role === 'MANAGER' ? '💼 Manager' :
                           user.role === 'STAFF' ? '👤 Staff' : '👁️ Viewer'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.status === 'ACTIVE' ? 'success' : 'error'}
                          className="shadow-sm"
                        >
                          {user.status === 'ACTIVE' ? '✅ ใช้งานได้' : '❌ ปิดใช้งาน'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-slate-600">
                          กิจกรรมล่าสุด
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-slate-600">
                          {formatDate(user.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200"
                            onClick={() => openEditModal(user)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            แก้ไข
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-200"
                            onClick={() => openDeleteModal(user)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            ลบ
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </EnhancedTable>
            </div>
          </Card>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl border">
            <h3 className="text-lg font-medium text-gray-900 mb-4">เพิ่มผู้ใช้งานใหม่</h3>
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อ
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="ชื่อผู้ใช้งาน"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  อีเมล *
                </label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="อีเมล"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  รหัสผ่าน *
                </label>
                <input
                  type="password"
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="รหัสผ่าน"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  บทบาท
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as any }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  disabled={!hasPermission('USERS', 'MANAGE_ROLES')}
                >
                  {Object.entries(ROLE_LABELS).map(([key, label]) => {
                    // เฉพาะ SUPER_ADMIN เท่านั้นที่สามารถกำหนดบทบาทได้
                    if (!hasPermission('USERS', 'MANAGE_ROLES') && key !== 'VIEWER') {
                      return null
                    }
                    return (
                      <option key={key} value={key}>{label}</option>
                    )
                  })}
                </select>
                {!hasPermission('USERS', 'MANAGE_ROLES') && (
                  <p className="text-xs text-gray-500 mt-1">
                    เฉพาะ Super Administrator เท่านั้นที่สามารถกำหนดบทบาทได้
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  สถานะ
                </label>
                <select
                  value={newUser.status}
                  onChange={(e) => setNewUser(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  สร้างผู้ใช้งาน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl border">
            <h3 className="text-lg font-medium mb-4">แก้ไขผู้ใช้งาน</h3>
            <form onSubmit={async (e) => {
              e.preventDefault()
              await handleEditUser()
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ</label>
                  <input
                    type="text"
                    value={editUser.name}
                    onChange={(e) => setEditUser({...editUser, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                  <input
                    type="email"
                    value={editUser.email}
                    onChange={(e) => setEditUser({...editUser, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">บทบาท</label>
                  <select
                    value={editUser.role}
                    onChange={(e) => setEditUser({...editUser, role: e.target.value as User['role']})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    disabled={!hasPermission('USERS', 'MANAGE_ROLES')}
                  >
                    {Object.entries(ROLE_LABELS).map(([key, label]) => {
                      // เฉพาะ SUPER_ADMIN เท่านั้นที่สามารถเปลี่ยนบทบาทได้
                      if (!hasPermission('USERS', 'MANAGE_ROLES') && key !== editUser.role) {
                        return null
                      }
                      return (
                        <option key={key} value={key}>{label}</option>
                      )
                    })}
                  </select>
                  {!hasPermission('USERS', 'MANAGE_ROLES') && (
                    <p className="text-xs text-gray-500 mt-1">
                      เฉพาะ Super Administrator เท่านั้นที่สามารถเปลี่ยนบทบาทได้
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                  <select
                    value={editUser.status}
                    onChange={(e) => setEditUser({...editUser, status: e.target.value as User['status']})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {Object.entries(STATUS_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
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
              คุณแน่ใจหรือไม่ที่ต้องการลบผู้ใช้งาน "{selectedUser?.name}" 
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
                onClick={handleDeleteUser}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                ลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </PermissionGuard>
  )
}