import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { hasPermission, getPermissionDeniedMessage } from '@/lib/permissions'
import type { UserRole } from '@prisma/client'

export interface PermissionCheckOptions {
  resource: string
  action: string
  allowOwnership?: boolean // อนุญาตให้เจ้าของข้อมูลสามารถเข้าถึงได้
  ownershipField?: string // ฟิลด์ที่ใช้เช็คความเป็นเจ้าของ (เช่น userId)
}

// Middleware สำหรับตรวจสอบสิทธิ์ใน API Routes
export async function withPermission(
  handler: (req: NextRequest, params?: any) => Promise<NextResponse>,
  options: PermissionCheckOptions
) {
  return async function (req: NextRequest, params?: any): Promise<NextResponse> {
    try {
      // ดึงข้อมูล session
      const session = await getServerSession(authOptions)
      
      if (!session || !session.user) {
        return NextResponse.json(
          { 
            error: 'Unauthorized',
            message: 'กรุณาเข้าสู่ระบบก่อนดำเนินการ'
          },
          { status: 401 }
        )
      }

      const userRole = session.user.role as UserRole
      const { resource, action, allowOwnership = false } = options

      // ตรวจสอบสิทธิ์ปกติ
      const hasRequiredPermission = hasPermission(userRole, resource, action)
      
      if (hasRequiredPermission) {
        return await handler(req, params)
      }

      // ถ้าไม่มีสิทธิ์ปกติ แต่อนุญาต ownership ให้ตรวจสอบเพิ่มเติม
      if (allowOwnership && options.ownershipField) {
        // ตรวจสอบความเป็นเจ้าของข้อมูล (implementation จะขึ้นอยู่กับแต่ละ API)
        // สำหรับตอนนี้ข้าม ownership check ไปก่อน
      }

      // ไม่มีสิทธิ์เข้าถึง
      const errorMessage = getPermissionDeniedMessage(resource, action)
      
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: errorMessage,
          requiredPermission: `${resource}:${action}`,
          userRole
        },
        { status: 403 }
      )

    } catch (error) {
      console.error('Permission middleware error:', error)
      return NextResponse.json(
        {
          error: 'Internal Server Error',
          message: 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์'
        },
        { status: 500 }
      )
    }
  }
}

// Helper function สำหรับตรวจสอบสิทธิ์แบบ shorthand
export async function checkPermission(
  resource: string, 
  action: string,
  session?: any
): Promise<{ success: boolean; message?: string; userRole?: UserRole }> {
  try {
    if (!session) {
      session = await getServerSession(authOptions)
    }

    if (!session || !session.user) {
      return {
        success: false,
        message: 'กรุณาเข้าสู่ระบบก่อนดำเนินการ'
      }
    }

    const userRole = session.user.role as UserRole
    const hasRequiredPermission = hasPermission(userRole, resource, action)

    if (!hasRequiredPermission) {
      return {
        success: false,
        message: getPermissionDeniedMessage(resource, action),
        userRole
      }
    }

    return {
      success: true,
      userRole
    }

  } catch (error) {
    console.error('Permission check error:', error)
    return {
      success: false,
      message: 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์'
    }
  }
}

// Decorator สำหรับใช้ใน API routes แบบง่าย
export function requirePermission(resource: string, action: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value
    
    descriptor.value = async function (...args: any[]) {
      const session = await getServerSession(authOptions)
      const permissionCheck = await checkPermission(resource, action, session)
      
      if (!permissionCheck.success) {
        return NextResponse.json(
          {
            error: 'Forbidden',
            message: permissionCheck.message,
            requiredPermission: `${resource}:${action}`
          },
          { status: 403 }
        )
      }
      
      return method.apply(this, args)
    }
  }
}

// Helper สำหรับการตรวจสอบสิทธิ์พิเศษ (เช่น SUPER_ADMIN เท่านั้น)
export async function requireSuperAdmin(session?: any): Promise<{ success: boolean; message?: string }> {
  try {
    if (!session) {
      session = await getServerSession(authOptions)
    }

    if (!session || !session.user) {
      return {
        success: false,
        message: 'กรุณาเข้าสู่ระบบก่อนดำเนินการ'
      }
    }

    if (session.user.role !== 'SUPER_ADMIN') {
      return {
        success: false,
        message: 'เฉพาะ Super Administrator เท่านั้นที่สามารถดำเนินการนี้ได้'
      }
    }

    return { success: true }

  } catch (error) {
    console.error('Super admin check error:', error)
    return {
      success: false,
      message: 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์'
    }
  }
}

// Helper สำหรับการตรวจสอบว่าผู้ใช้สามารถจัดการบทบาทได้หรือไม่
export async function canManageUserRole(
  currentUserRole: UserRole, 
  targetRole: UserRole
): Promise<{ success: boolean; message?: string }> {
  // เฉพาะ SUPER_ADMIN ที่สามารถจัดการบทบาทได้
  if (currentUserRole !== 'SUPER_ADMIN') {
    return {
      success: false,
      message: 'เฉพาะ Super Administrator เท่านั้นที่สามารถจัดการบทบาทผู้ใช้ได้'
    }
  }

  return { success: true }
}