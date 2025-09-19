'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

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
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">บทบาทและสิทธิ์</h1>
          <p className="text-sm text-gray-500 mt-1">
            จัดการบทบาทและสิทธิ์การเข้าถึงระบบ
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('roles')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'roles'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            บทบาท (Roles)
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'permissions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            สิทธิ์ (Permissions)
          </button>
        </nav>
      </div>

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-900">บทบาทในระบบ</h2>
            <button
              onClick={() => setShowCreateRoleModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              เพิ่มบทบาท
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => (
              <div key={role.name} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{role.displayName}</h3>
                    <p className="text-sm text-gray-500 mt-1">{role.description}</p>
                  </div>
                  <button
                    onClick={() => handleEditRole(role)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">สิทธิ์ทั้งหมด:</span>
                    <span className="font-medium">{role.permissions.length} รายการ</span>
                  </div>
                  
                  <div className="border-t pt-2">
                    <p className="text-xs text-gray-500 mb-2">สิทธิ์หลัก:</p>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 6).map((permission) => {
                        const [resource, action] = permission.split(':')
                        return (
                          <span
                            key={permission}
                            className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                          >
                            {RESOURCE_LABELS[resource] || resource}
                          </span>
                        )
                      })}
                      {role.permissions.length > 6 && (
                        <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                          +{role.permissions.length - 6} เพิ่มเติม
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Permissions Tab */}
      {activeTab === 'permissions' && (
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-6">สิทธิ์ในระบบ</h2>
          
          <div className="space-y-6">
            {Object.entries(groupedPermissions).map(([resource, permissions]) => (
              <div key={resource} className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {RESOURCE_LABELS[resource] || resource}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {permissions.map((permission) => (
                    <div
                      key={`${permission.resource}:${permission.action}`}
                      className="flex items-center p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {permission.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {permission.resource}:{permission.action}
                        </div>
                      </div>
                      <div className="ml-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          permission.action === 'READ' ? 'bg-green-100 text-green-800' :
                          permission.action === 'create' ? 'bg-blue-100 text-blue-800' :
                          permission.action === 'update' ? 'bg-yellow-100 text-yellow-800' :
                          permission.action === 'delete' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {permission.action.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create/Edit Role Modal */}
      {showCreateRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingRole ? 'แก้ไขบทบาท' : 'เพิ่มบทบาทใหม่'}
            </h3>
            
            <form onSubmit={handleCreateRole} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ชื่อบทบาท *
                  </label>
                  <input
                    type="text"
                    required
                    value={newRole.displayName}
                    onChange={(e) => setNewRole(prev => ({ ...prev, displayName: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    placeholder="เช่น ผู้จัดการ"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    รหัสบทบาท *
                  </label>
                  <input
                    type="text"
                    required
                    value={newRole.name}
                    onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    placeholder="เช่น manager"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  คำอธิบาย
                </label>
                <textarea
                  value={newRole.description}
                  onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  rows={3}
                  placeholder="อธิบายบทบาทและความรับผิดชอบ"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  สิทธิ์การเข้าถึง
                </label>
                
                <div className="space-y-4">
                  {Object.entries(groupedPermissions).map(([resource, permissions]) => (
                    <div key={resource} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">
                        {RESOURCE_LABELS[resource] || resource}
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {permissions.map((permission) => {
                          const permissionKey = `${permission.resource}:${permission.action}`
                          return (
                            <label
                              key={permissionKey}
                              className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={newRole.permissions.includes(permissionKey)}
                                onChange={() => handlePermissionToggle(permissionKey)}
                                className="mr-3 rounded border-gray-300"
                              />
                              <div className="flex-1">
                                <div className="text-sm text-gray-900">{permission.name}</div>
                                <div className="text-xs text-gray-500">{permission.action.toUpperCase()}</div>
                              </div>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4 border-t">
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
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  {editingRole ? 'บันทึกการแก้ไข' : 'สร้างบทบาท'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}