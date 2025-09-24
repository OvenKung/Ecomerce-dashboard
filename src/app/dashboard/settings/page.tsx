'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useToastNotification } from '@/hooks/use-toast-notification'

interface StoreSettings {
  name: string
  description: string
  email: string
  phone: string
  address: string
  website: string
  logo: string | null
  currency: string
  timezone: string
  language: string
}

interface NotificationSettings {
  emailNotifications: boolean
  orderNotifications: boolean
  inventoryAlerts: boolean
  customerNotifications: boolean
  marketingEmails: boolean
  systemUpdates: boolean
  lowStockThreshold: number
  emailTemplate: string
}

interface PaymentMethod {
  id: string
  name: string
  enabled: boolean
}

interface PaymentSettings {
  enableCreditCard: boolean
  enableBankTransfer: boolean
  enablePromptPay: boolean
  enableCOD: boolean
  paymentMethods: PaymentMethod[]
  taxRate: number
  shippingFee: number
}

interface ShippingZone {
  id: string
  name: string
  fee: number
}

interface ShippingSettings {
  freeShippingThreshold: number
  defaultShippingFee: number
  expressShippingFee: number
  shippingZones: ShippingZone[]
  estimatedDelivery: {
    standard: string
    express: string
  }
}

interface SecuritySettings {
  enableTwoFactor: boolean
  sessionTimeout: number
  passwordPolicy: {
    minLength: number
    requireUppercase: boolean
    requireLowercase: boolean
    requireNumbers: boolean
    requireSpecialChars: boolean
  }
  allowedLoginAttempts: number
  lockoutDuration: number
}

interface APIKey {
  id: string
  name: string
  key: string
  permissions: string[]
  lastUsed: string
  active: boolean
}

interface APISettings {
  enableAPI: boolean
  apiKeys: APIKey[]
  rateLimit: number
  webhookUrl: string
}

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const toast = useToastNotification()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('store')
  const hasFetched = useRef(false)
  
  // Settings state
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null)
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null)
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null)
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings | null>(null)
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings | null>(null)
  const [apiSettings, setAPISettings] = useState<APISettings | null>(null)

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/settings')
      
      if (response.status === 403) {
        toast.showError('คุณไม่มีสิทธิ์เข้าถึงการตั้งค่าระบบ')
        router.push('/dashboard')
        return
      }
      
      if (response.status === 401) {
        toast.showError('กรุณาเข้าสู่ระบบใหม่')
        router.push('/auth/signin')
        return
      }

      const data = await response.json()

      if (response.ok) {
        setStoreSettings(data.store)
        setNotificationSettings(data.notifications)
        setPaymentSettings(data.payment)
        setShippingSettings(data.shipping)
        setSecuritySettings(data.security)
        setAPISettings(data.api)
      } else {
        toast.showError(data.message || 'เกิดข้อผิดพลาดในการโหลดการตั้งค่า')
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.showError('เกิดข้อผิดพลาดในการโหลดการตั้งค่า')
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async (section: string, data: any) => {
    try {
      setSaving(true)
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ section, data }),
      })

      const result = await response.json()

      if (response.ok) {
        // Update local state
        switch (section) {
          case 'store':
            setStoreSettings(data)
            break
          case 'notifications':
            setNotificationSettings(data)
            break
          case 'payment':
            setPaymentSettings(data)
            break
          case 'shipping':
            setShippingSettings(data)
            break
          case 'security':
            setSecuritySettings(data)
            break
          case 'api':
            setAPISettings(data)
            break
        }
        toast.showSuccess(result.message || 'บันทึกการตั้งค่าเรียบร้อยแล้ว')
      } else {
        toast.showError(result.message || 'เกิดข้อผิดพลาดในการบันทึก')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.showError('เกิดข้อผิดพลาดในการบันทึก')
    } finally {
      setSaving(false)
    }
  }

  // Prevent refetch loops in production by limiting deps and guarding with a ref
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.replace('/auth/signin')
      return
    }

    // Only SUPER_ADMIN can access settings
    if (session.user?.role !== 'SUPER_ADMIN') {
      toast.showError('เฉพาะ Super Administrator เท่านั้นที่สามารถเข้าถึงการตั้งค่าได้')
      router.replace('/dashboard')
      return
    }

    if (!hasFetched.current) {
      hasFetched.current = true
      fetchSettings()
    }
  }, [status, session?.user?.role])

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  if (session.user?.role !== 'SUPER_ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">ไม่มีสิทธิ์เข้าถึง</h2>
          <p className="text-gray-600 mb-6">เฉพาะ Super Administrator เท่านั้นที่สามารถเข้าถึงการตั้งค่าระบบได้</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            กลับไปหน้าแดชบอร์ด
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">การตั้งค่าระบบ</h1>
        <p className="text-gray-600">จัดการการตั้งค่าร้านค้าและระบบ</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'store', name: 'ข้อมูลร้าน' },
            { id: 'notifications', name: 'การแจ้งเตือน' },
            { id: 'payment', name: 'การชำระเงิน' },
            { id: 'shipping', name: 'การจัดส่ง' },
            { id: 'security', name: 'ความปลอดภัย' },
            { id: 'api', name: 'API' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {loading ? (
        <div className="text-center py-8">กำลังโหลด...</div>
      ) : (
        <>
          {/* Store Settings */}
          {activeTab === 'store' && storeSettings && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">ข้อมูลร้านค้า</h3>
              <form onSubmit={(e) => {
                e.preventDefault()
                saveSettings('store', storeSettings)
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ชื่อร้าน
                    </label>
                    <input
                      type="text"
                      value={storeSettings.name}
                      onChange={(e) => setStoreSettings({...storeSettings, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      อีเมล
                    </label>
                    <input
                      type="email"
                      value={storeSettings.email}
                      onChange={(e) => setStoreSettings({...storeSettings, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      เบอร์โทรศัพท์
                    </label>
                    <input
                      type="tel"
                      value={storeSettings.phone}
                      onChange={(e) => setStoreSettings({...storeSettings, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      เว็บไซต์
                    </label>
                    <input
                      type="url"
                      value={storeSettings.website}
                      onChange={(e) => setStoreSettings({...storeSettings, website: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      คำอธิบายร้าน
                    </label>
                    <textarea
                      value={storeSettings.description}
                      onChange={(e) => setStoreSettings({...storeSettings, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ที่อยู่
                    </label>
                    <textarea
                      value={storeSettings.address}
                      onChange={(e) => setStoreSettings({...storeSettings, address: e.target.value})}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && notificationSettings && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">การตั้งค่าการแจ้งเตือน</h3>
              <form onSubmit={(e) => {
                e.preventDefault()
                saveSettings('notifications', notificationSettings)
              }}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-900">การแจ้งเตือนทางอีเมล</label>
                      <p className="text-sm text-gray-500">รับการแจ้งเตือนสำคัญทางอีเมล</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.emailNotifications}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings, 
                        emailNotifications: e.target.checked
                      })}
                      className="h-4 w-4 text-blue-600"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-900">แจ้งเตือนคำสั่งซื้อ</label>
                      <p className="text-sm text-gray-500">แจ้งเตือนเมื่อมีคำสั่งซื้อใหม่</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.orderNotifications}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings, 
                        orderNotifications: e.target.checked
                      })}
                      className="h-4 w-4 text-blue-600"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-900">แจ้งเตือนสต็อกต่ำ</label>
                      <p className="text-sm text-gray-500">แจ้งเตือนเมื่อสินค้าใกล้หมด</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.inventoryAlerts}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings, 
                        inventoryAlerts: e.target.checked
                      })}
                      className="h-4 w-4 text-blue-600"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-900">แจ้งเตือนลูกค้า</label>
                      <p className="text-sm text-gray-500">แจ้งเตือนเกี่ยวกับลูกค้าใหม่</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.customerNotifications}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings, 
                        customerNotifications: e.target.checked
                      })}
                      className="h-4 w-4 text-blue-600"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      เกณฑ์สต็อกต่ำ
                    </label>
                    <input
                      type="number"
                      value={notificationSettings.lowStockThreshold}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings, 
                        lowStockThreshold: parseInt(e.target.value)
                      })}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <span className="ml-2 text-sm text-gray-500">ชิ้น</span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Payment Settings */}
          {activeTab === 'payment' && paymentSettings && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">การตั้งค่าการชำระเงิน</h3>
              <form onSubmit={(e) => {
                e.preventDefault()
                saveSettings('payment', paymentSettings)
              }}>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">วิธีการชำระเงิน</h4>
                    <div className="space-y-3">
                      {paymentSettings.paymentMethods.map((method) => (
                        <div key={method.id} className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-900">{method.name}</label>
                          <input
                            type="checkbox"
                            checked={method.enabled}
                            onChange={(e) => {
                              const updatedMethods = paymentSettings.paymentMethods.map(m => 
                                m.id === method.id ? { ...m, enabled: e.target.checked } : m
                              )
                              setPaymentSettings({
                                ...paymentSettings,
                                paymentMethods: updatedMethods
                              })
                            }}
                            className="h-4 w-4 text-blue-600"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        อัตราภาษี (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={paymentSettings.taxRate}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings, 
                          taxRate: parseFloat(e.target.value)
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ค่าจัดส่งเริ่มต้น (บาท)
                      </label>
                      <input
                        type="number"
                        value={paymentSettings.shippingFee}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings, 
                          shippingFee: parseInt(e.target.value)
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Shipping Settings */}
          {activeTab === 'shipping' && shippingSettings && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">การตั้งค่าการจัดส่ง</h3>
              <form onSubmit={(e) => {
                e.preventDefault()
                saveSettings('shipping', shippingSettings)
              }}>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ขั้นต่ำฟรีค่าส่ง (บาท)
                      </label>
                      <input
                        type="number"
                        value={shippingSettings.freeShippingThreshold}
                        onChange={(e) => setShippingSettings({
                          ...shippingSettings, 
                          freeShippingThreshold: parseInt(e.target.value)
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ค่าส่งปกติ (บาท)
                      </label>
                      <input
                        type="number"
                        value={shippingSettings.defaultShippingFee}
                        onChange={(e) => setShippingSettings({
                          ...shippingSettings, 
                          defaultShippingFee: parseInt(e.target.value)
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ค่าส่งด่วน (บาท)
                      </label>
                      <input
                        type="number"
                        value={shippingSettings.expressShippingFee}
                        onChange={(e) => setShippingSettings({
                          ...shippingSettings, 
                          expressShippingFee: parseInt(e.target.value)
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">โซนการจัดส่ง</h4>
                    <div className="space-y-3">
                      {shippingSettings.shippingZones.map((zone, index) => (
                        <div key={zone.id} className="flex items-center justify-between border p-3 rounded">
                          <span className="text-sm font-medium text-gray-900">{zone.name}</span>
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              value={zone.fee}
                              onChange={(e) => {
                                const updatedZones = [...shippingSettings.shippingZones]
                                updatedZones[index] = { ...zone, fee: parseInt(e.target.value) }
                                setShippingSettings({
                                  ...shippingSettings,
                                  shippingZones: updatedZones
                                })
                              }}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                            <span className="text-sm text-gray-500">บาท</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && securitySettings && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">การตั้งค่าความปลอดภัย</h3>
              <form onSubmit={(e) => {
                e.preventDefault()
                saveSettings('security', securitySettings)
              }}>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-900">การยืนยันตัวตนแบบ 2 ขั้นตอน</label>
                      <p className="text-sm text-gray-500">เพิ่มความปลอดภัยด้วยการยืนยันตัวตนแบบ 2 ขั้นตอน</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={securitySettings.enableTwoFactor}
                      onChange={(e) => setSecuritySettings({
                        ...securitySettings, 
                        enableTwoFactor: e.target.checked
                      })}
                      className="h-4 w-4 text-blue-600"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        หมดเวลา Session (ชั่วโมง)
                      </label>
                      <input
                        type="number"
                        value={securitySettings.sessionTimeout}
                        onChange={(e) => setSecuritySettings({
                          ...securitySettings, 
                          sessionTimeout: parseInt(e.target.value)
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        จำนวนครั้งที่ล็อกอินผิด
                      </label>
                      <input
                        type="number"
                        value={securitySettings.allowedLoginAttempts}
                        onChange={(e) => setSecuritySettings({
                          ...securitySettings, 
                          allowedLoginAttempts: parseInt(e.target.value)
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ล็อกบัญชี (นาที)
                      </label>
                      <input
                        type="number"
                        value={securitySettings.lockoutDuration}
                        onChange={(e) => setSecuritySettings({
                          ...securitySettings, 
                          lockoutDuration: parseInt(e.target.value)
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">นีโยบายรหัสผ่าน</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">ต้องมีตัวอักษรพิมพ์ใหญ่</span>
                        <input
                          type="checkbox"
                          checked={securitySettings.passwordPolicy.requireUppercase}
                          onChange={(e) => setSecuritySettings({
                            ...securitySettings,
                            passwordPolicy: {
                              ...securitySettings.passwordPolicy,
                              requireUppercase: e.target.checked
                            }
                          })}
                          className="h-4 w-4 text-blue-600"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">ต้องมีตัวเลข</span>
                        <input
                          type="checkbox"
                          checked={securitySettings.passwordPolicy.requireNumbers}
                          onChange={(e) => setSecuritySettings({
                            ...securitySettings,
                            passwordPolicy: {
                              ...securitySettings.passwordPolicy,
                              requireNumbers: e.target.checked
                            }
                          })}
                          className="h-4 w-4 text-blue-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* API Settings */}
          {activeTab === 'api' && apiSettings && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">การตั้งค่า API</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-900">เปิดใช้งาน API</label>
                    <p className="text-sm text-gray-500">อนุญาตให้เข้าถึงผ่าน API</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={apiSettings.enableAPI}
                    onChange={(e) => setAPISettings({
                      ...apiSettings, 
                      enableAPI: e.target.checked
                    })}
                    className="h-4 w-4 text-blue-600"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    จำกัดจำนวนการร้องขอ (ต่อชั่วโมง)
                  </label>
                  <input
                    type="number"
                    value={apiSettings.rateLimit}
                    onChange={(e) => setAPISettings({
                      ...apiSettings, 
                      rateLimit: parseInt(e.target.value)
                    })}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">API Keys</h4>
                  <div className="space-y-3">
                    {apiSettings.apiKeys.map((key) => (
                      <div key={key.id} className="border p-3 rounded-md">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{key.name}</p>
                            <p className="text-sm text-gray-500 font-mono">{key.key}</p>
                            <p className="text-xs text-gray-400">
                              ใช้ครั้งล่าสุด: {new Date(key.lastUsed).toLocaleDateString('th-TH')}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            key.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {key.active ? 'ใช้งาน' : 'ปิดใช้งาน'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    onClick={() => saveSettings('api', apiSettings)}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}