'use client'

import { useSession } from 'next-auth/react'
import { hasPermission, getPermissionDeniedMessage, ROLE_HIERARCHY } from '@/lib/permissions'
import { useToastNotification } from '@/hooks/use-toast-notification'
import type { UserRole } from '@prisma/client'
import { useRouter } from 'next/navigation'

export interface UsePermissionReturn {
  // ตรวจสอบสิทธิ์
  hasPermission: (resource: string, action: string) => boolean
  hasAnyPermission: (permissions: Array<{ resource: string; action: string }>) => boolean
  hasAllPermissions: (permissions: Array<{ resource: string; action: string }>) => boolean
  
  // ตรวจสอบบทบาท
  isRole: (role: UserRole) => boolean
  isMinimumRole: (role: UserRole) => boolean
  canManageRole: (targetRole: UserRole) => boolean
  
  // การทำงานที่มีการตรวจสอบสิทธิ์
  executeWithPermission: (
    resource: string, 
    action: string, 
    callback: () => void | Promise<void>,
    options?: {
      showDeniedMessage?: boolean
      redirectOnDenied?: string
      customDeniedMessage?: string
    }
  ) => Promise<void>
  
  // ข้อมูลผู้ใช้ปัจจุบัน
  userRole: UserRole | null
  isAuthenticated: boolean
  isLoading: boolean
}

export function usePermission(): UsePermissionReturn {
  const { data: session, status } = useSession()
  const { showError, showWarning } = useToastNotification()
  const router = useRouter()
  
  const userRole = session?.user?.role as UserRole | null
  const isAuthenticated = !!session?.user
  const isLoading = status === 'loading'

  // ตรวจสอบสิทธิ์พื้นฐาน
  const checkPermission = (resource: string, action: string): boolean => {
    if (!userRole) return false
    return hasPermission(userRole, resource, action)
  }

  // ตรวจสอบสิทธิ์หลายอัน (อย่างน้อย 1 อัน)
  const checkAnyPermission = (permissions: Array<{ resource: string; action: string }>): boolean => {
    if (!userRole) return false
    return permissions.some(({ resource, action }) => 
      hasPermission(userRole, resource, action)
    )
  }

  // ตรวจสอบสิทธิ์ทั้งหมด
  const checkAllPermissions = (permissions: Array<{ resource: string; action: string }>): boolean => {
    if (!userRole) return false
    return permissions.every(({ resource, action }) => 
      hasPermission(userRole, resource, action)
    )
  }

  // ตรวจสอบบทบาทที่ต้องการ
  const checkIsRole = (role: UserRole): boolean => {
    return userRole === role
  }

  // ตรวจสอบบทบาทขั้นต่ำ
  const checkIsMinimumRole = (role: UserRole): boolean => {
    if (!userRole) return false
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[role]
  }

  // ตรวจสอบว่าสามารถจัดการบทบาทได้หรือไม่
  const checkCanManageRole = (targetRole: UserRole): boolean => {
    if (!userRole) return false
    
    // เฉพาะ SUPER_ADMIN เท่านั้นที่สามารถจัดการบทบาทได้
    if (userRole !== 'SUPER_ADMIN') return false
    
    // SUPER_ADMIN สามารถจัดการบทบาททุกระดับได้
    return true
  }

  // ดำเนินการที่มีการตรวจสอบสิทธิ์
  const executeWithPermission = async (
    resource: string,
    action: string,
    callback: () => void | Promise<void>,
    options: {
      showDeniedMessage?: boolean
      redirectOnDenied?: string
      customDeniedMessage?: string
    } = {}
  ): Promise<void> => {
    const {
      showDeniedMessage = true,
      redirectOnDenied,
      customDeniedMessage
    } = options

    // ตรวจสอบการเข้าสู่ระบบ
    if (!isAuthenticated) {
      showError('กรุณาเข้าสู่ระบบก่อนดำเนินการ')
      router.push('/auth/signin')
      return
    }

    // ตรวจสอบสิทธิ์
    if (!checkPermission(resource, action)) {
      const message = customDeniedMessage || getPermissionDeniedMessage(resource, action)
      
      if (showDeniedMessage) {
        showError(message)
      }
      
      if (redirectOnDenied) {
        router.push(redirectOnDenied)
      }
      
      return
    }

    // ดำเนินการ
    try {
      await callback()
    } catch (error) {
      console.error('Error executing callback:', error)
      showError('เกิดข้อผิดพลาดในการดำเนินการ')
    }
  }

  return {
    hasPermission: checkPermission,
    hasAnyPermission: checkAnyPermission,
    hasAllPermissions: checkAllPermissions,
    isRole: checkIsRole,
    isMinimumRole: checkIsMinimumRole,
    canManageRole: checkCanManageRole,
    executeWithPermission,
    userRole,
    isAuthenticated,
    isLoading
  }
}

// Hook สำหรับการใช้งานใน Component แบบง่าย
export function useRoleGuard(requiredRole: UserRole) {
  const { isMinimumRole, userRole, isLoading } = usePermission()
  
  return {
    hasAccess: isMinimumRole(requiredRole),
    userRole,
    isLoading
  }
}

// Hook สำหรับการใช้งานใน Component ที่ต้องการสิทธิ์เฉพาะ
export function usePermissionGuard(resource: string, action: string) {
  const { hasPermission, userRole, isLoading } = usePermission()
  
  return {
    hasAccess: hasPermission(resource, action),
    userRole,
    isLoading
  }
}

// Hook สำหรับ Component ที่ต้องการหลายสิทธิ์
export function useMultiPermissionGuard(
  permissions: Array<{ resource: string; action: string }>,
  requireAll: boolean = false
) {
  const { hasAnyPermission, hasAllPermissions, userRole, isLoading } = usePermission()
  
  return {
    hasAccess: requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions),
    userRole,
    isLoading
  }
}