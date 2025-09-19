'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button, IconButton } from '@/components/ui/button'
import { Card, StatCard } from '@/components/ui/card'
import { 
  EnhancedTable, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell, 
  Badge 
} from '@/components/ui/table'
import { 
  Shield, 
  ShieldCheck, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Settings,
  Eye,
  Lock
} from 'lucide-react'

const PERMISSIONS = [
  { resource: 'DASHBOARD', action: 'READ', name: 'ดูหน้าแดชบอร์ด' },
  { resource: 'PRODUCTS', action: 'CREATE', name: 'เพิ่มสินค้า' },
  { resource: 'PRODUCTS', action: 'READ', name: 'ดูสินค้า' },
  { resource: 'PRODUCTS', action: 'UPDATE', name: 'แก้ไขสินค้า' },
  { resource: 'PRODUCTS', action: 'DELETE', name: 'ลบสินค้า' },
  { resource: 'CATEGORIES', action: 'CREATE', name: 'เพิ่มหมวดหมู่' },
  { resource: 'CATEGORIES', action: 'READ', name: 'ดูหมวดหมู่' },
  { resource: 'CATEGORIES', action: 'UPDATE', name: 'แก้ไขหมวดหมู่' },
  { resource: 'CATEGORIES', action: 'DELETE', name: 'ลบหมวดหมู่' },
  { resource: 'BRANDS', action: 'CREATE', name: 'เพิ่มแบรนด์' },
  { resource: 'BRANDS', action: 'READ', name: 'ดูแบรนด์' },
  { resource: 'BRANDS', action: 'UPDATE', name: 'แก้ไขแบรนด์' },
  { resource: 'BRANDS', action: 'DELETE', name: 'ลบแบรนด์' },
  { resource: 'ORDERS', action: 'CREATE', name: 'สร้างคำสั่งซื้อ' },
  { resource: 'ORDERS', action: 'READ', name: 'ดูคำสั่งซื้อ' },
  { resource: 'ORDERS', action: 'UPDATE', name: 'แก้ไขคำสั่งซื้อ' },
  { resource: 'ORDERS', action: 'DELETE', name: 'ลบคำสั่งซื้อ' },
  { resource: 'CUSTOMERS', action: 'CREATE', name: 'เพิ่มลูกค้า' },
  { resource: 'CUSTOMERS', action: 'READ', name: 'ดูลูกค้า' },
  { resource: 'CUSTOMERS', action: 'UPDATE', name: 'แก้ไขลูกค้า' },
  { resource: 'CUSTOMERS', action: 'DELETE', name: 'ลบลูกค้า' },
  { resource: 'MARKETING', action: 'CREATE', name: 'สร้างแคมเปญการตลาด' },
  { resource: 'MARKETING', action: 'READ', name: 'ดูการตลาด' },
  { resource: 'MARKETING', action: 'UPDATE', name: 'แก้ไขการตลาด' },
  { resource: 'MARKETING', action: 'DELETE', name: 'ลบการตลาด' },
  { resource: 'COUPONS', action: 'CREATE', name: 'สร้างคูปอง' },
  { resource: 'COUPONS', action: 'READ', name: 'ดูคูปอง' },
  { resource: 'COUPONS', action: 'UPDATE', name: 'แก้ไขคูปอง' },
  { resource: 'COUPONS', action: 'DELETE', name: 'ลบคูปอง' },
  { resource: 'ANALYTICS', action: 'READ', name: 'ดูรายงานวิเคราะห์' },
  { resource: 'REPORTS', action: 'READ', name: 'ดูรายงาน' },
  { resource: 'SETTINGS', action: 'READ', name: 'ดูการตั้งค่า' },
  { resource: 'SETTINGS', action: 'UPDATE', name: 'แก้ไขการตั้งค่า' },
  { resource: 'USERS', action: 'CREATE', name: 'เพิ่มผู้ใช้งาน' },
  { resource: 'USERS', action: 'READ', name: 'ดูผู้ใช้งาน' },
  { resource: 'USERS', action: 'UPDATE', name: 'แก้ไขผู้ใช้งาน' },
  { resource: 'USERS', action: 'DELETE', name: 'ลบผู้ใช้งาน' },
  { resource: 'ROLES', action: 'CREATE', name: 'สร้างบทบาท' },
  { resource: 'ROLES', action: 'READ', name: 'ดูบทบาท' },
  { resource: 'ROLES', action: 'UPDATE', name: 'แก้ไขบทบาท' },
  { resource: 'ROLES', action: 'DELETE', name: 'ลบบทบาท' },
  { resource: 'AUDIT_LOGS', action: 'READ', name: 'ดูประวัติการใช้งาน' }
]

const PREDEFINED_ROLES = [
  {
    name: 'super_admin',
    displayName: 'ผู้ดูแลระบบสูงสุด',
    description: 'มีสิทธิ์เข้าถึงทุกส่วนของระบบ',
    permissions: PERMISSIONS.map(p => `${p.resource}:${p.action}`)
  },
  {
    name: 'admin',
    displayName: 'ผู้ดูแลระบบ',
    description: 'มีสิทธิ์เข้าถึงส่วนใหญ่ของระบบ ยกเว้นการจัดการผู้ใช้งาน',
    permissions: PERMISSIONS.filter(p => !['USERS', 'ROLES'].includes(p.resource)).map(p => `${p.resource}:${p.action}`)
  },
  {
    name: 'manager',
    displayName: 'ผู้จัดการ',
    description: 'มีสิทธิ์จัดการสินค้า คำสั่งซื้อ และการตลาด',
    permissions: PERMISSIONS.filter(p => ['DASHBOARD', 'PRODUCTS', 'CATEGORIES', 'BRANDS', 'ORDERS', 'CUSTOMERS', 'MARKETING', 'COUPONS', 'ANALYTICS', 'REPORTS'].includes(p.resource)).map(p => `${p.resource}:${p.action}`)
  },
  {
    name: 'staff',
    displayName: 'พนักงาน',
    description: 'มีสิทธิ์ดูและแก้ไขสินค้า คำสั่งซื้อ',
    permissions: PERMISSIONS.filter(p => ['DASHBOARD', 'PRODUCTS', 'CATEGORIES', 'BRANDS', 'ORDERS', 'CUSTOMERS'].includes(p.resource) && ['READ', 'UPDATE'].includes(p.action)).map(p => `${p.resource}:${p.action}`)
  },
  {
    name: 'viewer',
    displayName: 'ผู้อ่าน',
    description: 'มีสิทธิ์ดูข้อมูลเท่านั้น',
    permissions: PERMISSIONS.filter(p => p.action === 'READ').map(p => `${p.resource}:${p.action}`)
  }
]

export default function RolesPermissionsPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions'>('roles')
  const [roles, setRoles] = useState(PREDEFINED_ROLES)
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false)
  const [editingRole, setEditingRole] = useState<any>(null)
  
  const [newRole, setNewRole] = useState({
    name: '',
    displayName: '',
    description: '',
    permissions: [] as string[]
  })

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault()
    // ในระบบจริงจะเรียก API
    const role = {
      ...newRole,
      name: newRole.name.toLowerCase().replace(/\s+/g, '_'),
    }
    setRoles(prev => [...prev, role])
    setNewRole({
      name: '',
      displayName: '',
      description: '',
      permissions: []
    })
    setShowCreateRoleModal(false)
  }

  const handlePermissionToggle = (permission: string) => {
    setNewRole(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }))
  }

  const handleEditRole = (role: any) => {
    setEditingRole(role)
    setNewRole({
      name: role.displayName,
      displayName: role.displayName,
      description: role.description,
      permissions: role.permissions
    })
    setShowCreateRoleModal(true)
  }

  const groupedPermissions = PERMISSIONS.reduce((acc, permission) => {
    const resource = permission.resource
    if (!acc[resource]) {
      acc[resource] = []
    }
    acc[resource].push(permission)
    return acc
  }, {} as Record<string, typeof PERMISSIONS>)

  const RESOURCE_LABELS: Record<string, string> = {
    DASHBOARD: 'แดชบอร์ด',
    PRODUCTS: 'สินค้า',
    CATEGORIES: 'หมวดหมู่',
    BRANDS: 'แบรนด์',
    ORDERS: 'คำสั่งซื้อ',
    CUSTOMERS: 'ลูกค้า',
    MARKETING: 'การตลาด',
    COUPONS: 'คูปอง',
    CAMPAIGNS: 'แคมเปญ',
    ANALYTICS: 'วิเคราะห์',
    REPORTS: 'รายงาน',
    SETTINGS: 'การตั้งค่า',
    USERS: 'ผู้ใช้งาน',
    ROLES: 'บทบาท',
    PERMISSIONS: 'สิทธิ์',
    AUDIT_LOGS: 'ประวัติการใช้งาน'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="relative p-4 space-y-6">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl"></div>
          <div className="absolute top-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
        </div>

        {/* Header */}
        <div className="relative">
          <Card variant="glass" className="border-white/20 backdrop-blur-sm">
            <div className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                    บทบาทและสิทธิ์
                  </h1>
                  <p className="mt-2 text-slate-600">
                    จัดการบทบาทและสิทธิ์การเข้าถึงระบบ
                  </p>
                </div>
                <Button 
                  onClick={() => setShowCreateRoleModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 rounded-xl px-6 py-2.5 font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  เพิ่มบทบาท
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Role Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          <StatCard
            title="บทบาททั้งหมด"
            value={roles.length.toString()}
            trend={{
              value: 12,
              isPositive: true,
              period: 'total roles'
            }}
            icon={Shield}
            color="blue"
            className="animate-slide-in-up"
            style={{ animationDelay: '0.1s' }}
          />
          <StatCard
            title="บทบาทที่ใช้งาน"
            value={roles.length.toString()}
            trend={{
              value: 100,
              isPositive: true,
              period: 'active rate'
            }}
            icon={ShieldCheck}
            color="green"
            className="animate-slide-in-up"
            style={{ animationDelay: '0.2s' }}
          />
          <StatCard
            title="สิทธิ์ทั้งหมด"
            value={PERMISSIONS.length.toString()}
            trend={{
              value: 24,
              isPositive: true,
              period: 'permissions'
            }}
            icon={Lock}
            color="purple"
            className="animate-slide-in-up"
            style={{ animationDelay: '0.3s' }}
          />
          <StatCard
            title="ผู้ใช้ที่มีบทบาท"
            value="25"
            trend={{
              value: 8,
              isPositive: true,
              period: 'assigned users'
            }}
            icon={Users}
            color="red"
            className="animate-slide-in-up"
            style={{ animationDelay: '0.4s' }}
          />
        </div>

        {/* Tabs */}
        <Card variant="glass" className="border-white/20 backdrop-blur-sm relative">
          <div className="border-b border-slate-200/50">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('roles')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-all duration-300 ${
                  activeTab === 'roles'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                บทบาท (Roles)
              </button>
              <button
                onClick={() => setActiveTab('permissions')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-all duration-300 ${
                  activeTab === 'permissions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                สิทธิ์ (Permissions)
              </button>
            </nav>
          </div>
        </Card>

        {/* Roles Tab */}
        {activeTab === 'roles' && (
          <div className="relative">
            <Card variant="glass" className="border-white/20 backdrop-blur-sm mb-6">
              <div className="p-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
                    บทบาทในระบบ
                  </h2>
                  <Button
                    onClick={() => setShowCreateRoleModal(true)}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 rounded-xl px-4 py-2 font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    เพิ่มบทบาท
                  </Button>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roles.map((role, index) => (
                <Card 
                  key={role.name} 
                  variant="glass" 
                  className="border-white/20 backdrop-blur-sm p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 animate-slide-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{role.displayName}</h3>
                      <p className="text-sm text-slate-600 mt-1">{role.description}</p>
                    </div>
                    <IconButton
                      icon={Edit}
                      variant="ghost"
                      size="sm"
                      tooltip="แก้ไข"
                      onClick={() => handleEditRole(role)}
                      className="hover:bg-blue-100 hover:text-blue-600 transition-all duration-300 rounded-xl"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 font-medium">สิทธิ์ทั้งหมด:</span>
                      <span className="font-semibold text-slate-900 bg-blue-100 px-2 py-1 rounded-lg text-xs">
                        {role.permissions.length} รายการ
                      </span>
                    </div>
                    
                    <div className="border-t border-slate-200/50 pt-3">
                      <p className="text-xs text-slate-500 mb-2 font-medium">สิทธิ์หลัก:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {role.permissions.slice(0, 6).map((permission) => {
                          const [resource, action] = permission.split(':')
                          return (
                            <Badge
                              key={permission}
                              variant="secondary"
                              className="text-xs bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300"
                            >
                              {RESOURCE_LABELS[resource] || resource}
                            </Badge>
                          )
                        })}
                        {role.permissions.length > 6 && (
                          <Badge 
                            variant="secondary" 
                            className="text-xs bg-gradient-to-r from-slate-50 to-gray-50 text-slate-700 border-slate-200"
                          >
                            +{role.permissions.length - 6} เพิ่มเติม
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Permissions Tab */}
        {activeTab === 'permissions' && (
          <div className="relative">
            <Card variant="glass" className="border-white/20 backdrop-blur-sm mb-6">
              <div className="p-6">
                <h2 className="text-xl font-semibold bg-gradient-to-r from-slate-900 to-purple-900 bg-clip-text text-transparent">
                  สิทธิ์ในระบบ
                </h2>
              </div>
            </Card>
            
            <div className="space-y-6">
              {Object.entries(groupedPermissions).map(([resource, permissions], index) => (
                <Card 
                  key={resource} 
                  variant="glass" 
                  className="border-white/20 backdrop-blur-sm p-6 animate-slide-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                    <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full mr-3"></div>
                    {RESOURCE_LABELS[resource] || resource}
                  </h3>
                  
                  <EnhancedTable className="bg-white/30 backdrop-blur-sm rounded-xl border border-white/20">
                    <TableHeader>
                      <TableRow className="border-b border-slate-200/50">
                        <TableHead className="text-slate-700 font-semibold">สิทธิ์</TableHead>
                        <TableHead className="text-slate-700 font-semibold">รายละเอียด</TableHead>
                        <TableHead className="text-slate-700 font-semibold">ประเภท</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {permissions.map((permission) => (
                        <TableRow 
                          key={`${permission.resource}:${permission.action}`}
                          className="hover:bg-white/20 transition-all duration-300"
                        >
                          <TableCell>
                            <div className="font-medium text-slate-900">
                              {permission.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-slate-600">
                              {permission.resource}:{permission.action}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                permission.action === 'READ' ? 'success' :
                                permission.action === 'CREATE' ? 'info' :
                                permission.action === 'UPDATE' ? 'warning' :
                                permission.action === 'DELETE' ? 'error' :
                                'secondary'
                              }
                              className="font-medium"
                            >
                              {permission.action}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </EnhancedTable>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Create/Edit Role Modal */}
        {showCreateRoleModal && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/30">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent mb-6">
                {editingRole ? 'แก้ไขบทบาท' : 'เพิ่มบทบาทใหม่'}
              </h3>
              
              <form onSubmit={handleCreateRole} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      ชื่อบทบาท *
                    </label>
                    <input
                      type="text"
                      required
                      value={newRole.displayName}
                      onChange={(e) => setNewRole(prev => ({ ...prev, displayName: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      placeholder="เช่น ผู้จัดการ"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      รหัสบทบาท *
                    </label>
                    <input
                      type="text"
                      required
                      value={newRole.name}
                      onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      placeholder="เช่น manager"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    คำอธิบาย
                  </label>
                  <textarea
                    value={newRole.description}
                    onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    rows={3}
                    placeholder="อธิบายบทบาทและความรับผิดชอบ"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    สิทธิ์การเข้าถึง
                  </label>
                  
                  <div className="space-y-4">
                    {Object.entries(groupedPermissions).map(([resource, permissions]) => (
                      <div key={resource} className="border border-slate-200/50 rounded-xl p-4 bg-white/50 backdrop-blur-sm">
                        <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
                          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mr-2"></div>
                          {RESOURCE_LABELS[resource] || resource}
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {permissions.map((permission) => {
                            const permissionKey = `${permission.resource}:${permission.action}`
                            return (
                              <label
                                key={permissionKey}
                                className="flex items-center p-3 hover:bg-blue-50 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-blue-200"
                              >
                                <input
                                  type="checkbox"
                                  checked={newRole.permissions.includes(permissionKey)}
                                  onChange={() => handlePermissionToggle(permissionKey)}
                                  className="mr-3 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-slate-900">{permission.name}</div>
                                  <div className="text-xs text-slate-500 font-medium">{permission.action.toUpperCase()}</div>
                                </div>
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex space-x-4 pt-6 border-t border-slate-200/50">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateRoleModal(false)
                      setEditingRole(null)
                      setNewRole({
                        name: '',
                        displayName: '',
                        description: '',
                        permissions: []
                      })
                    }}
                    className="flex-1 bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 px-6 py-3 rounded-xl hover:from-slate-200 hover:to-gray-200 font-medium transition-all duration-300 border border-slate-200"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    {editingRole ? 'บันทึกการแก้ไข' : 'สร้างบทบาท'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}