import type { UserRole } from '@prisma/client'

export interface Permission {
  resource: string
  action: string
}

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  VIEWER: 1,
  STAFF: 2,
  MANAGER: 3,
  ADMIN: 4,
  SUPER_ADMIN: 5,
}

// ข้อความแจ้งเตือนเมื่อไม่มีสิทธิ์
export const PERMISSION_DENIED_MESSAGES = {
  PRODUCTS: {
    READ: 'คุณไม่มีสิทธิ์ในการดูข้อมูลสินค้า',
    CREATE: 'คุณไม่มีสิทธิ์ในการเพิ่มสินค้าใหม่',
    UPDATE: 'คุณไม่มีสิทธิ์ในการแก้ไขข้อมูลสินค้า',
    DELETE: 'คุณไม่มีสิทธิ์ในการลบสินค้า'
  },
  ORDERS: {
    READ: 'คุณไม่มีสิทธิ์ในการดูข้อมูลคำสั่งซื้อ',
    CREATE: 'คุณไม่มีสิทธิ์ในการสร้างคำสั่งซื้อ',
    UPDATE: 'คุณไม่มีสิทธิ์ในการแก้ไขคำสั่งซื้อ',
    DELETE: 'คุณไม่มีสิทธิ์ในการลบคำสั่งซื้อ'
  },
  CUSTOMERS: {
    READ: 'คุณไม่มีสิทธิ์ในการดูข้อมูลลูกค้า',
    CREATE: 'คุณไม่มีสิทธิ์ในการเพิ่มลูกค้าใหม่',
    UPDATE: 'คุณไม่มีสิทธิ์ในการแก้ไขข้อมูลลูกค้า',
    DELETE: 'คุณไม่มีสิทธิ์ในการลบลูกค้า'
  },
  USERS: {
    READ: 'คุณไม่มีสิทธิ์ในการดูข้อมูลผู้ใช้',
    CREATE: 'คุณไม่มีสิทธิ์ในการสร้างผู้ใช้ใหม่',
    UPDATE: 'คุณไม่มีสิทธิ์ในการแก้ไขข้อมูลผู้ใช้',
    DELETE: 'คุณไม่มีสิทธิ์ในการลบผู้ใช้',
    MANAGE_ROLES: 'คุณไม่มีสิทธิ์ในการจัดการบทบาทผู้ใช้'
  },
  MARKETING: {
    READ: 'คุณไม่มีสิทธิ์ในการดูข้อมูลการตลาด',
    CREATE: 'คุณไม่มีสิทธิ์ในการสร้างแคมเปญการตลาด',
    UPDATE: 'คุณไม่มีสิทธิ์ในการแก้ไขแคมเปญการตลาด',
    DELETE: 'คุณไม่มีสิทธิ์ในการลบแคมเปญการตลาด'
  },
  COUPONS: {
    READ: 'คุณไม่มีสิทธิ์ในการดูคูปอง',
    CREATE: 'คุณไม่มีสิทธิ์ในการสร้างคูปองใหม่',
    UPDATE: 'คุณไม่มีสิทธิ์ในการแก้ไขคูปอง',
    DELETE: 'คุณไม่มีสิทธิ์ในการลบคูปอง'
  },
  ANALYTICS: {
    READ: 'คุณไม่มีสิทธิ์ในการดูรายงานและสถิติ',
    EXPORT: 'คุณไม่มีสิทธิ์ในการส่งออกรายงาน'
  },
  SETTINGS: {
    READ: 'คุณไม่มีสิทธิ์ในการดูการตั้งค่าระบบ',
    UPDATE: 'คุณไม่มีสิทธิ์ในการแก้ไขการตั้งค่าระบบ'
  }
} as const

// ฟังก์ชันตรวจสอบสิทธิ์ตามบทบาท
export function hasPermission(
  userRole: UserRole, 
  resource: string, 
  action: string
): boolean {
  // Super Admin มีสิทธิ์ทุกอย่าง
  if (userRole === 'SUPER_ADMIN') {
    return true
  }

  // กำหนดสิทธิ์สำหรับแต่ละบทบาท - อัปเดตให้ครบถ้วนมากขึ้น
  const rolePermissions: Record<UserRole, string[]> = {
    SUPER_ADMIN: ['*:*'], // สิทธิ์ทุกอย่าง
    
    ADMIN: [
      'DASHBOARD:READ',
      'PRODUCTS:*',
      'CATEGORIES:*',
      'BRANDS:*',
      'ORDERS:*',
      'CUSTOMERS:*',
      'MARKETING:*',
      'COUPONS:*',
      'CAMPAIGNS:*',
      'ANALYTICS:READ',
      'ANALYTICS:EXPORT',
      'REPORTS:READ',
      'REPORTS:EXPORT',
      'SETTINGS:READ',
      'SETTINGS:UPDATE',
      'AUDIT_LOGS:READ',
      'USERS:READ',
      'USERS:CREATE',
      'USERS:UPDATE',
      'USERS:DELETE',
      'INVENTORY:*'
    ],
    
    MANAGER: [
      'DASHBOARD:READ',
      'PRODUCTS:*',
      'CATEGORIES:*',
      'BRANDS:*',
      'ORDERS:*',
      'CUSTOMERS:*',
      'MARKETING:*',
      'COUPONS:*',
      'CAMPAIGNS:*',
      'ANALYTICS:READ',
      'REPORTS:READ',
      'USERS:READ',
      'INVENTORY:*'
    ],
    
    STAFF: [
      'DASHBOARD:READ',
      'PRODUCTS:READ',
      'PRODUCTS:UPDATE',
      'CATEGORIES:READ',
      'BRANDS:READ',
      'ORDERS:READ',
      'ORDERS:UPDATE',
      'CUSTOMERS:READ',
      'CUSTOMERS:UPDATE',
      'MARKETING:READ',
      'COUPONS:READ',
      'INVENTORY:READ',
      'INVENTORY:UPDATE'
    ],
    
    VIEWER: [
      'DASHBOARD:READ',
      'PRODUCTS:READ',
      'CATEGORIES:READ',
      'BRANDS:READ',
      'ORDERS:READ',
      'CUSTOMERS:READ',
      'ANALYTICS:READ',
      'REPORTS:READ',
      'INVENTORY:READ'
    ]
  }

  const permissions = rolePermissions[userRole] || []
  const requestedPermission = `${resource}:${action}`
  
  // ตรวจสอบสิทธิ์โดยตรง
  if (permissions.includes(requestedPermission)) {
    return true
  }
  
  // ตรวจสอบสิทธิ์แบบ wildcard
  if (permissions.includes(`${resource}:*`)) {
    return true
  }
  
  // ตรวจสอบสิทธิ์ทุกอย่าง
  if (permissions.includes('*:*')) {
    return true
  }
  
  return false
}

// ฟังก์ชันรับข้อความแจ้งเตือน
export function getPermissionDeniedMessage(resource: string, action: string): string {
  const resourceMessages = PERMISSION_DENIED_MESSAGES[resource as keyof typeof PERMISSION_DENIED_MESSAGES]
  if (resourceMessages && resourceMessages[action as keyof typeof resourceMessages]) {
    return resourceMessages[action as keyof typeof resourceMessages]
  }
  return `คุณไม่มีสิทธิ์ในการดำเนินการ ${action} กับ ${resource}`
}

// Legacy function for backward compatibility
export function hasPermissionLegacy(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

export function hasAnyPermission(
  userRole: UserRole,
  permissions: Permission[]
): boolean {
  return permissions.some(permission => 
    hasPermission(userRole, permission.resource, permission.action)
  )
}

// ฟังก์ชันตรวจสอบสิทธิ์ทุกๆ อย่าง
export function hasAllPermissions(
  userRole: UserRole,
  permissions: Permission[]
): boolean {
  return permissions.every(permission => 
    hasPermission(userRole, permission.resource, permission.action)
  )
}

// ฟังก์ชันตรวจสอบว่าผู้ใช้สามารถเข้าถึงหน้านั้นๆ ได้หรือไม่
export function canAccessPage(userRole: UserRole, pathname: string): boolean {
  const pagePermissions: Record<string, Permission> = {
    '/dashboard': { resource: 'DASHBOARD', action: 'READ' },
    '/dashboard/products': { resource: 'PRODUCTS', action: 'READ' },
    '/dashboard/products/add': { resource: 'PRODUCTS', action: 'CREATE' },
    '/dashboard/products/categories': { resource: 'CATEGORIES', action: 'READ' },
    '/dashboard/products/brands': { resource: 'BRANDS', action: 'READ' },
    '/dashboard/orders': { resource: 'ORDERS', action: 'READ' },
    '/dashboard/customers': { resource: 'CUSTOMERS', action: 'READ' },
    '/dashboard/marketing': { resource: 'MARKETING', action: 'READ' },
    '/dashboard/marketing/coupons': { resource: 'COUPONS', action: 'READ' },
    '/dashboard/marketing/campaigns': { resource: 'CAMPAIGNS', action: 'READ' },
    '/dashboard/analytics': { resource: 'ANALYTICS', action: 'READ' },
    '/dashboard/reports': { resource: 'REPORTS', action: 'READ' },
    '/dashboard/users': { resource: 'USERS', action: 'READ' },
    '/dashboard/roles': { resource: 'ROLES', action: 'READ' },
    '/dashboard/settings': { resource: 'SETTINGS', action: 'READ' }
  }

  const permission = pagePermissions[pathname]
  if (!permission) {
    return true // หากไม่มีการกำหนดสิทธิ์ ให้เข้าถึงได้
  }

  return hasPermission(userRole, permission.resource, permission.action)
}

export function canAccess(userRole: UserRole, resource: string): boolean {
  const permissions: Record<string, UserRole[]> = {
    // Product Management
    'products.view': ['ADMIN', 'STAFF', 'VIEWER'],
    'products.create': ['ADMIN', 'STAFF'],
    'products.edit': ['ADMIN', 'STAFF'],
    'products.delete': ['ADMIN'],
    
    // Order Management
    'orders.view': ['ADMIN', 'STAFF', 'VIEWER'],
    'orders.create': ['ADMIN', 'STAFF'],
    'orders.edit': ['ADMIN', 'STAFF'],
    'orders.delete': ['ADMIN'],
    'orders.refund': ['ADMIN'],
    
    // Customer Management
    'customers.view': ['ADMIN', 'STAFF', 'VIEWER'],
    'customers.create': ['ADMIN', 'STAFF'],
    'customers.edit': ['ADMIN', 'STAFF'],
    'customers.delete': ['ADMIN'],
    'customers.blacklist': ['ADMIN'],
    
    // Analytics
    'analytics.view': ['ADMIN', 'STAFF', 'VIEWER'],
    'analytics.export': ['ADMIN', 'STAFF'],
    
    // Marketing
    'marketing.view': ['ADMIN', 'STAFF'],
    'marketing.create': ['ADMIN', 'STAFF'],
    'marketing.edit': ['ADMIN', 'STAFF'],
    'marketing.delete': ['ADMIN'],
    
    // System Settings
    'settings.view': ['ADMIN'],
    'settings.edit': ['ADMIN'],
    
    // User Management
    'users.view': ['ADMIN'],
    'users.create': ['ADMIN'],
    'users.edit': ['ADMIN'],
    'users.delete': ['ADMIN'],
    
    // Audit Logs
    'audit.view': ['ADMIN'],
    
    // Inventory
    'inventory.view': ['ADMIN', 'STAFF', 'VIEWER'],
    'inventory.adjust': ['ADMIN', 'STAFF'],
    
    // Reports
    'reports.view': ['ADMIN', 'STAFF'],
    'reports.export': ['ADMIN', 'STAFF'],
  }

  const requiredRoles = permissions[resource]
  if (!requiredRoles) return false
  
  return requiredRoles.includes(userRole)
}

export function getRoleDisplayName(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    SUPER_ADMIN: 'Super Administrator',
    ADMIN: 'Administrator',
    MANAGER: 'Manager',
    STAFF: 'Staff Member',
    VIEWER: 'Viewer',
  }
  return displayNames[role]
}

export function getRoleColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    SUPER_ADMIN: 'bg-purple-100 text-purple-800',
    ADMIN: 'bg-red-100 text-red-800',
    MANAGER: 'bg-orange-100 text-orange-800',
    STAFF: 'bg-blue-100 text-blue-800',
    VIEWER: 'bg-gray-100 text-gray-800',
  }
  return colors[role]
}

export function getAvailableRoles(currentUserRole: UserRole): UserRole[] {
  // Users can only assign roles equal to or lower than their own
  const allRoles: UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF', 'VIEWER']
  const currentLevel = ROLE_HIERARCHY[currentUserRole]
  
  return allRoles.filter(role => ROLE_HIERARCHY[role] <= currentLevel)
}