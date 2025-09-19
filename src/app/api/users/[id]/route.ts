import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkPermission } from '@/lib/permission-middleware'
import bcrypt from 'bcryptjs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ตรวจสอบสิทธิ์ในการดูข้อมูลผู้ใช้
    const permissionCheck = await checkPermission('USERS', 'READ')
    if (!permissionCheck.success) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: permissionCheck.message 
        }, 
        { status: 403 }
      )
    }

    const { id } = await params
    const session = await getServerSession(authOptions)

    // อนุญาตให้ดูข้อมูลตัวเองหรือมีสิทธิ์จัดการผู้ใช้
    const canAccessOtherUsers = permissionCheck.userRole && ['ADMIN', 'SUPER_ADMIN'].includes(permissionCheck.userRole)
    const isOwnProfile = session?.user?.id === id

    if (!canAccessOtherUsers && !isOwnProfile) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'คุณสามารถดูได้เฉพาะข้อมูลของตัวเองเท่านั้น' 
        }, 
        { status: 403 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            auditLogs: true,
            createdOrders: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'ไม่พบผู้ใช้' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })

  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // ตรวจสอบสิทธิ์ในการแก้ไขข้อมูลผู้ใช้
    const permissionCheck = await checkPermission('USERS', 'UPDATE')
    if (!permissionCheck.success) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: permissionCheck.message 
        }, 
        { status: 403 }
      )
    }

    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { name, email, password, role, status } = body

    // อนุญาตให้แก้ไขข้อมูลตัวเองหรือมีสิทธิ์จัดการผู้ใช้
    const canUpdateOtherUsers = permissionCheck.userRole && ['ADMIN', 'SUPER_ADMIN'].includes(permissionCheck.userRole)
    const isOwnProfile = session?.user?.id === id

    if (!canUpdateOtherUsers && !isOwnProfile) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'คุณสามารถแก้ไขได้เฉพาะข้อมูลของตัวเองเท่านั้น' 
        }, 
        { status: 403 }
      )
    }

    // ตรวจสอบการเปลี่ยนบทบาท - เฉพาะ SUPER_ADMIN เท่านั้น
    if (role && permissionCheck.userRole !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'เฉพาะ Super Administrator เท่านั้นที่สามารถเปลี่ยนบทบาทผู้ใช้ได้' 
        }, 
        { status: 403 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'ไม่พบผู้ใช้' },
        { status: 404 }
      )
    }

    // ป้องกันการแก้ไขสถานะโดยผู้ใช้ทั่วไป
    if (status !== undefined && !canUpdateOtherUsers) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'คุณไม่มีสิทธิ์ในการเปลี่ยนสถานะผู้ใช้' 
        }, 
        { status: 403 }
      )
    }

    // Check if email is being changed and already exists
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      })

      if (emailExists) {
        return NextResponse.json(
          { error: 'อีเมลนี้ถูกใช้งานแล้ว' },
          { status: 400 }
        )
      }
    }

    // Hash password if provided
    let hashedPassword = undefined
    if (password) {
      hashedPassword = await bcrypt.hash(password, 12)
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(email && { email }),
        ...(hashedPassword && { password: hashedPassword }),
        ...(role && permissionCheck.userRole === 'SUPER_ADMIN' && { role }),
        ...(status !== undefined && canUpdateOtherUsers && { status })
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      message: 'อัปเดตข้อมูลผู้ใช้สำเร็จ',
      user: updatedUser
    })

  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'ไม่สามารถอัปเดตข้อมูลผู้ใช้ได้' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // ตรวจสอบสิทธิ์ในการลบผู้ใช้
    const permissionCheck = await checkPermission('USERS', 'DELETE')
    if (!permissionCheck.success) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: permissionCheck.message 
        }, 
        { status: 403 }
      )
    }

    const session = await getServerSession(authOptions)

    // Prevent self-deletion
    if (session?.user?.id === id) {
      return NextResponse.json(
        { error: 'ไม่สามารถลบบัญชีของตัวเองได้' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'ไม่พบผู้ใช้' },
        { status: 404 }
      )
    }

    // เฉพาะ SUPER_ADMIN เท่านั้นที่สามารถลบผู้ใช้ที่มีบทบาทสูงได้
    if (['ADMIN', 'SUPER_ADMIN'].includes(existingUser.role) && permissionCheck.userRole !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'เฉพาะ Super Administrator เท่านั้นที่สามารถลบ Admin หรือ Super Admin ได้' 
        }, 
        { status: 403 }
      )
    }

    // Check if user has created orders (prevent deletion if they have)
    const orderCount = await prisma.order.count({
      where: { createdById: id }
    })

    if (orderCount > 0) {
      return NextResponse.json(
        { error: 'ไม่สามารถลบผู้ใช้ที่สร้างคำสั่งซื้อแล้วได้' },
        { status: 400 }
      )
    }

    // Delete user
    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'ลบผู้ใช้สำเร็จ'
    })

  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'ไม่สามารถลบผู้ใช้ได้' },
      { status: 500 }
    )
  }
}
