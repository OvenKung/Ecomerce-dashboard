'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { usePermission } from '@/hooks/use-permission'
import { PermissionGuard } from '@/components/permission/PermissionGuard'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [productsMenuOpen, setProductsMenuOpen] = useState(
    pathname.startsWith('/dashboard/products')
  )
  const [marketingMenuOpen, setMarketingMenuOpen] = useState(
    pathname.startsWith('/dashboard/marketing')
  )
  const { hasPermission } = usePermission()

  const navigation = [
    {
      name: 'แดชบอร์ด',
      href: '/dashboard',
      permission: null, // Always visible
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v14l-5-3-5 3V5z" />
        </svg>
      ),
    },
    {
      name: 'สินค้า',
      href: '/dashboard/products',
      permission: 'products:read',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M12 11l8-4" />
        </svg>
      ),
      hasSubmenu: true,
      submenu: [
        { name: 'รายการสินค้า', href: '/dashboard/products', permission: 'products:read' },
        { name: 'เพิ่มสินค้า', href: '/dashboard/products/add', permission: 'products:create' },
        { name: 'หมวดหมู่', href: '/dashboard/products/categories', permission: 'categories:read' },
        { name: 'แบรนด์', href: '/dashboard/products/brands', permission: 'brands:read' },
      ]
    },
    {
      name: 'สินค้าคงคลัง',
      href: '/dashboard/inventory',
      permission: 'inventory:read',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      name: 'ออเดอร์',
      href: '/dashboard/orders',
      permission: 'orders:read',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      name: 'ลูกค้า',
      href: '/dashboard/customers',
      permission: 'customers:read',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m9 5.197v1M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      name: 'การตลาด',
      href: '/dashboard/marketing',
      permission: 'marketing:read',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      ),
      hasSubmenu: true,
      submenu: [
        { name: 'ภาพรวม', href: '/dashboard/marketing', permission: 'marketing:read' },
        { name: 'คูปอง', href: '/dashboard/marketing/coupons', permission: 'coupons:read' },
        { name: 'แคมเปญ', href: '/dashboard/marketing/campaigns', permission: 'campaigns:read' },
      ]
    },
    {
      name: 'รายงาน',
      href: '/dashboard/reports',
      permission: 'reports:read',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      name: 'การวิเคราะห์',
      href: '/dashboard/analytics',
      permission: 'analytics:read',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
    {
      name: 'ผู้ใช้งาน',
      href: '/dashboard/users',
      permission: 'users:read',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
    },
    {
      name: 'บทบาทและสิทธิ์',
      href: '/dashboard/roles',
      permission: 'users:manage_roles',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      name: 'ตั้งค่า',
      href: '/dashboard/settings',
      permission: 'settings:read',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ]

  // Filter navigation items based on permissions
  const visibleNavigation = navigation.filter(item => 
    !item.permission || hasPermission(item.permission, (session?.user as any)?.role || 'VIEWER')
  )

  const renderNavigationItem = (item: any, isMobile = false) => {
    // Check if user has permission to view this item
    if (item.permission && !hasPermission(item.permission, (session?.user as any)?.role || 'VIEWER')) {
      return null
    }

    if (item.hasSubmenu) {
      const isSubmenuOpen = item.name === 'สินค้า' ? productsMenuOpen : 
                            item.name === 'การตลาด' ? marketingMenuOpen : false
      const isActive = pathname.startsWith(item.href)
      
      // Filter submenu items based on permissions
      const visibleSubmenu = item.submenu?.filter((subItem: any) => 
        !subItem.permission || hasPermission(subItem.permission, (session?.user as any)?.role || 'VIEWER')
      ) || []

      // Don't show menu if no submenu items are visible
      if (visibleSubmenu.length === 0) {
        return null
      }
      
      return (
        <div key={item.name}>
          <button
            onClick={() => {
              if (item.name === 'สินค้า') {
                setProductsMenuOpen(!productsMenuOpen)
              } else if (item.name === 'การตลาด') {
                setMarketingMenuOpen(!marketingMenuOpen)
              }
            }}
            className={`w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive
                ? 'bg-blue-100 text-blue-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {item.icon}
            <span className="ml-3">{item.name}</span>
            <svg
              className={`ml-auto h-5 w-5 transition-transform ${
                isSubmenuOpen ? 'rotate-90' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          {isSubmenuOpen && (
            <div className="ml-6 mt-1 space-y-1">
              {visibleSubmenu.map((subItem: any) => (
                <Link
                  key={subItem.name}
                  href={subItem.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    pathname === subItem.href
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={isMobile ? () => setSidebarOpen(false) : undefined}
                >
                  {subItem.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      )
    }

    return (
      <Link
        key={item.name}
        href={item.href}
        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
          pathname === item.href
            ? 'bg-blue-100 text-blue-900'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
        onClick={isMobile ? () => setSidebarOpen(false) : undefined}
      >
        {item.icon}
        <span className="ml-3">{item.name}</span>
      </Link>
    )
  }

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu */}
      {sidebarOpen && (
        <div className="relative z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-0 z-40 flex">
            <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
                <div className="flex items-center flex-shrink-0 px-4">
                  <h1 className="text-xl font-bold text-gray-900">E-Commerce Dashboard</h1>
                </div>
                <nav className="mt-5 flex-1 space-y-1 px-2">
                  {visibleNavigation.map(item => renderNavigationItem(item, true))}
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-1 flex-col min-h-0 bg-white border-r border-gray-200">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-white border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">E-Commerce Dashboard</h1>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {visibleNavigation.map(item => renderNavigationItem(item))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              <div className="w-full flex md:ml-0">
                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                  {/* Search can be added here if needed */}
                </div>
              </div>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <div className="relative">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {session?.user?.name?.[0] || session?.user?.email?.[0] || 'U'}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">
                      {session?.user?.name || session?.user?.email}
                    </div>
                    <div className="text-sm font-medium text-gray-500">
                      {(session?.user as any)?.role || 'ผู้ใช้'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}