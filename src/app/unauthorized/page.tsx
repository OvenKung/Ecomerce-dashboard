'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePermission } from '@/hooks/use-permission'

export default function UnauthorizedPage() {
  const router = useRouter()
  const { userRole, isAuthenticated } = usePermission()
  
  // Default values that were previously props
  const message = 'คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้'
  const redirectPath = '/dashboard'
  const autoRedirectDelay = 5000

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/signin')
      return
    }

    // Auto redirect after delay
    const timer = setTimeout(() => {
      router.push(redirectPath)
    }, autoRedirectDelay)

    return () => clearTimeout(timer)
  }, [isAuthenticated, router, redirectPath, autoRedirectDelay])

  if (!isAuthenticated) {
    return null // จะ redirect ไป signin
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg 
            className="h-8 w-8 text-red-600" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth="1.5" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" 
            />
          </svg>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          ไม่มีสิทธิ์เข้าถึง
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {message}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            {/* User Info */}
            <div className="text-center">
              <div className="text-sm text-gray-500">
                <p>บทบาทปัจจุบันของคุณ</p>
                <div className="mt-2">
                  {userRole && (
                    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                      userRole === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                      userRole === 'ADMIN' ? 'bg-red-100 text-red-800' :
                      userRole === 'MANAGER' ? 'bg-orange-100 text-orange-800' :
                      userRole === 'STAFF' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {userRole === 'SUPER_ADMIN' ? 'ผู้ดูแลระบบสูงสุด' :
                       userRole === 'ADMIN' ? 'ผู้ดูแลระบบ' :
                       userRole === 'MANAGER' ? 'ผู้จัดการ' :
                       userRole === 'STAFF' ? 'พนักงาน' :
                       'ผู้อ่าน'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Reason and Suggestions */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg 
                    className="h-5 w-5 text-yellow-400" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    สิ่งที่คุณสามารถทำได้
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>ติดต่อผู้ดูแลระบบเพื่อขอสิทธิ์เพิ่มเติม</li>
                      <li>กลับไปยังหน้าหลักของ Dashboard</li>
                      <li>ตรวจสอบบทบาทและสิทธิ์ของคุณ</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                กลับสู่หน้าหลัก
              </button>
              
              <button
                onClick={() => router.back()}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                กลับหน้าก่อนหน้า
              </button>
            </div>

            {/* Auto Redirect Info */}
            <div className="text-center text-xs text-gray-500">
              <p>
                จะเปลี่ยนเส้นทางไปยังหน้าหลักโดยอัตโนมัติในอีก {autoRedirectDelay / 1000} วินาที
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}