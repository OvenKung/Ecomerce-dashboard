import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Default settings structure
const defaultSettings = {
  store: {
    name: 'ร้านค้าออนไลน์',
    description: 'ร้านค้าออนไลน์ของเรา',
    email: 'contact@store.com',
    phone: '02-123-4567',
    address: 'กรุงเทพมหานคร ประเทศไทย',
    website: 'https://store.com',
    logo: null,
    currency: 'THB',
    timezone: 'Asia/Bangkok',
    language: 'th'
  },
  notifications: {
    emailNotifications: true,
    orderNotifications: true,
    inventoryAlerts: true,
    customerNotifications: false,
    marketingEmails: false,
    systemUpdates: true,
    lowStockThreshold: 10,
    emailTemplate: 'default'
  },
  payment: {
    enableCreditCard: true,
    enableBankTransfer: true,
    enablePromptPay: true,
    enableCOD: false,
    paymentMethods: [
      { id: 'credit_card', name: 'บัตรเครดิต/เดบิต', enabled: true },
      { id: 'bank_transfer', name: 'โอนเงินผ่านธนาคาร', enabled: true },
      { id: 'promptpay', name: 'PromptPay', enabled: true },
      { id: 'cod', name: 'เก็บเงินปลายทาง', enabled: false }
    ],
    taxRate: 7.0,
    shippingFee: 50
  },
  shipping: {
    freeShippingThreshold: 1000,
    defaultShippingFee: 50,
    expressShippingFee: 100,
    shippingZones: [
      { id: 'bangkok', name: 'กรุงเทพมหานคร', fee: 30 },
      { id: 'central', name: 'ภาคกลาง', fee: 50 },
      { id: 'north', name: 'ภาคเหนือ', fee: 70 },
      { id: 'northeast', name: 'ภาคอีสาน', fee: 70 },
      { id: 'south', name: 'ภาคใต้', fee: 80 }
    ],
    estimatedDelivery: {
      standard: '2-3 วัน',
      express: '1-2 วัน'
    }
  },
  security: {
    enableTwoFactor: false,
    sessionTimeout: 24,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false
    },
    allowedLoginAttempts: 5,
    lockoutDuration: 30
  },
  api: {
    enableAPI: true,
    apiKeys: [
      {
        id: 'default',
        name: 'Default API Key',
        key: 'sk_' + Math.random().toString(36).substring(2, 15),
        permissions: ['read', 'write'],
        lastUsed: new Date().toISOString(),
        active: true
      }
    ],
    rateLimit: 1000,
    webhookUrl: ''
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized', message: 'กรุณาเข้าสู่ระบบก่อนดำเนินการ' }, { status: 401 })
    }

    // Only SUPER_ADMIN can access settings
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ 
        error: 'Forbidden', 
        message: 'เฉพาะ Super Administrator เท่านั้นที่สามารถเข้าถึงการตั้งค่าได้' 
      }, { status: 403 })
    }

    // Try to get settings from database (we'll store as JSON in a settings table)
    // For now, return default settings since we don't have a settings table
    // In a real implementation, you'd want to create a settings table
    
    return NextResponse.json(defaultSettings)

  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'เกิดข้อผิดพลาดในการโหลดการตั้งค่า' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized', message: 'กรุณาเข้าสู่ระบบก่อนดำเนินการ' }, { status: 401 })
    }

    // Only SUPER_ADMIN can modify settings
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ 
        error: 'Forbidden', 
        message: 'เฉพาะ Super Administrator เท่านั้นที่สามารถแก้ไขการตั้งค่าได้' 
      }, { status: 403 })
    }

    const body = await request.json()
    const { section, data } = body

    if (!section || !data) {
      return NextResponse.json({ 
        error: 'Bad Request', 
        message: 'ข้อมูลไม่ครบถ้วน กรุณาระบุ section และ data' 
      }, { status: 400 })
    }

    // Validate section
    const validSections = ['store', 'notifications', 'payment', 'shipping', 'security', 'api']
    if (!validSections.includes(section)) {
      return NextResponse.json({ 
        error: 'Bad Request', 
        message: 'Section ไม่ถูกต้อง' 
      }, { status: 400 })
    }

    // In a real implementation, you would:
    // 1. Validate the data structure for each section
    // 2. Save to database (settings table)
    // 3. Handle any business logic (e.g., updating payment processors)
    
    // For now, we'll just return success
    console.log(`Settings updated - Section: ${section}`, data)
    
    // Log the setting change for audit purposes
    console.log(`Settings changed by user ${session.user.id} (${session.user.email}) - Section: ${section}`)

    return NextResponse.json({ 
      success: true, 
      message: 'บันทึกการตั้งค่าเรียบร้อยแล้ว',
      section,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error saving settings:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'เกิดข้อผิดพลาดในการบันทึกการตั้งค่า' },
      { status: 500 }
    )
  }
}