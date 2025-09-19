'use client'

import React from 'react'
import { usePermission, useRoleGuard, usePermissionGuard } from '@/hooks/use-permission'
import type { UserRole } from '@prisma/client'

// Component สำหรับการจำกัดสิทธิ์ตามบทบาท
interface RoleGuardProps {
  role: UserRole
  children: React.ReactNode
  fallback?: React.ReactNode
  showMessage?: boolean
}

export function RoleGuard({ role, children, fallback, showMessage = false }: RoleGuardProps) {
  const { hasAccess, isLoading } = useRoleGuard(role)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>
    }
    
    if (showMessage) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600">คุณไม่มีสิทธิ์ในการเข้าถึงส่วนนี้</p>
          <p className="text-sm text-red-500 mt-1">ต้องการบทบาท: {role}</p>
        </div>
      )
    }
    
    return null
  }

  return <>{children}</>
}

// Component สำหรับการจำกัดสิทธิ์ตามการกระทำ
interface PermissionGuardProps {
  resource: string
  action: string
  children: React.ReactNode
  fallback?: React.ReactNode
  showMessage?: boolean
}

export function PermissionGuard({ 
  resource, 
  action, 
  children, 
  fallback, 
  showMessage = false 
}: PermissionGuardProps) {
  const { hasAccess, isLoading } = usePermissionGuard(resource, action)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>
    }
    
    if (showMessage) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600">คุณไม่มีสิทธิ์ในการดำเนินการนี้</p>
          <p className="text-sm text-red-500 mt-1">สิทธิ์ที่ต้องการ: {resource}:{action}</p>
        </div>
      )
    }
    
    return null
  }

  return <>{children}</>
}

// Component สำหรับการจำกัดสิทธิ์แบบหลายเงื่อนไข
interface MultiPermissionGuardProps {
  permissions: Array<{ resource: string; action: string }>
  requireAll?: boolean
  children: React.ReactNode
  fallback?: React.ReactNode
  showMessage?: boolean
}

export function MultiPermissionGuard({ 
  permissions, 
  requireAll = false, 
  children, 
  fallback, 
  showMessage = false 
}: MultiPermissionGuardProps) {
  const { hasAnyPermission, hasAllPermissions, isLoading } = usePermission()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const hasAccess = requireAll 
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions)

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>
    }
    
    if (showMessage) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600">คุณไม่มีสิทธิ์ในการเข้าถึงส่วนนี้</p>
          <div className="text-sm text-red-500 mt-1">
            <p className="font-medium">สิทธิ์ที่ต้องการ{requireAll ? ' (ทั้งหมด)' : ' (อย่างน้อย 1 อัน)'}:</p>
            <ul className="list-disc list-inside mt-1">
              {permissions.map(({ resource, action }, index) => (
                <li key={index}>{resource}:{action}</li>
              ))}
            </ul>
          </div>
        </div>
      )
    }
    
    return null
  }

  return <>{children}</>
}

// Component สำหรับปุ่มที่มีการตรวจสอบสิทธิ์
interface PermissionButtonProps {
  resource: string
  action: string
  onClick: () => void | Promise<void>
  children: React.ReactNode
  className?: string
  disabled?: boolean
  showDeniedMessage?: boolean
  variant?: 'primary' | 'secondary' | 'danger'
}

export function PermissionButton({
  resource,
  action,
  onClick,
  children,
  className = '',
  disabled = false,
  showDeniedMessage = true,
  variant = 'primary'
}: PermissionButtonProps) {
  const { executeWithPermission, hasPermission } = usePermission()

  const baseClasses = "px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
  
  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
    danger: "bg-red-600 hover:bg-red-700 text-white"
  }

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${className}`
  const hasAccess = hasPermission(resource, action)

  const handleClick = () => {
    executeWithPermission(resource, action, onClick, {
      showDeniedMessage
    })
  }

  return (
    <button
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || !hasAccess}
    >
      {children}
    </button>
  )
}

// Component สำหรับแสดงข้อมูลบทบาทผู้ใช้
export function UserRoleBadge() {
  const { userRole, isAuthenticated } = usePermission()

  if (!isAuthenticated || !userRole) {
    return null
  }

  const roleColors = {
    SUPER_ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
    ADMIN: 'bg-red-100 text-red-800 border-red-200',
    MANAGER: 'bg-orange-100 text-orange-800 border-orange-200',
    STAFF: 'bg-blue-100 text-blue-800 border-blue-200',
    VIEWER: 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const roleLabels = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Admin',
    MANAGER: 'Manager',
    STAFF: 'Staff',
    VIEWER: 'Viewer'
  }

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${roleColors[userRole]}`}>
      {roleLabels[userRole]}
    </span>
  )
}

// Higher-Order Component สำหรับการป้องกันหน้า
export function withPermission<T extends {}>(
  WrappedComponent: React.ComponentType<T>,
  resource: string,
  action: string
) {
  return function PermissionWrappedComponent(props: T) {
    return (
      <PermissionGuard resource={resource} action={action} showMessage={true}>
        <WrappedComponent {...props} />
      </PermissionGuard>
    )
  }
}

// Higher-Order Component สำหรับการป้องกันหน้าตามบทบาท
export function withRole<T extends {}>(
  WrappedComponent: React.ComponentType<T>,
  role: UserRole
) {
  return function RoleWrappedComponent(props: T) {
    return (
      <RoleGuard role={role} showMessage={true}>
        <WrappedComponent {...props} />
      </RoleGuard>
    )
  }
}