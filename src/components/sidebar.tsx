'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Megaphone, 
  Settings, 
  UserPlus,
  FileText,
  Menu,
  X,
  LogOut,
  ChevronDown,
  ChevronRight,
  Store,
  User,
  Bell,
  Search
} from 'lucide-react'
import { canAccess } from '@/lib/permissions'
import { cn } from '@/lib/utils'
import type { Session } from 'next-auth'

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  permission?: string
  children?: NavigationItem[]
  badge?: string | number
}

const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Products',
    href: '/dashboard/products',
    icon: Package,
    permission: 'products.view',
    badge: 'NEW',
    children: [
      { name: 'All Products', href: '/dashboard/products', icon: Package },
      { name: 'Add Product', href: '/dashboard/products/add', icon: Package },
      { name: 'Categories', href: '/dashboard/products/categories', icon: Package },
      { name: 'Brands', href: '/dashboard/products/brands', icon: Package },
    ]
  },
  {
    name: 'Inventory',
    href: '/dashboard/inventory',
    icon: Store,
    permission: 'inventory.view',
  },
  {
    name: 'Orders',
    href: '/dashboard/orders',
    icon: ShoppingCart,
    permission: 'orders.view',
    badge: 5,
    children: [
      { name: 'All Orders', href: '/dashboard/orders', icon: ShoppingCart },
      { name: 'Pending', href: '/dashboard/orders?status=pending', icon: ShoppingCart, badge: 3 },
      { name: 'Processing', href: '/dashboard/orders?status=processing', icon: ShoppingCart },
      { name: 'Shipped', href: '/dashboard/orders?status=shipped', icon: ShoppingCart },
    ]
  },
  {
    name: 'Customers',
    href: '/dashboard/customers',
    icon: Users,
    permission: 'customers.view',
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
    permission: 'analytics.view',
  },
  {
    name: 'Marketing',
    href: '/dashboard/marketing',
    icon: Megaphone,
    permission: 'marketing.view',
    children: [
      { name: 'Coupons', href: '/dashboard/marketing/coupons', icon: Megaphone },
      { name: 'Campaigns', href: '/dashboard/marketing/campaigns', icon: Megaphone },
      { name: 'Promotions', href: '/dashboard/marketing/promotions', icon: Megaphone },
    ]
  },
  {
    name: 'Reports',
    href: '/dashboard/reports',
    icon: FileText,
    permission: 'reports.view',
  },
  {
    name: 'Users',
    href: '/dashboard/users',
    icon: UserPlus,
    permission: 'users.view',
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    permission: 'superadmin.only',
  },
]

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const pathname = usePathname()
  const { data: session } = useSession()

  // Auto-expand menu if current page is a child
  useEffect(() => {
    navigation.forEach(item => {
      if (item.children && item.children.some(child => pathname.startsWith(child.href))) {
        setExpandedItems(prev => 
          prev.includes(item.name) ? prev : [...prev, item.name]
        )
      }
    })
  }, [pathname])

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }

  const filteredNavigation = navigation.filter(item => {
    // Handle special permissions
    if (item.permission === 'superadmin.only') {
      return session?.user?.role === 'SUPER_ADMIN'
    }
    
    if (!item.permission) return true
    return session?.user?.role && canAccess(session.user.role as any, item.permission)
  }).filter(item => {
    if (!searchQuery) return true
    return item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (item.children && item.children.some(child => 
             child.name.toLowerCase().includes(searchQuery.toLowerCase())
           ))
  })

  const NavigationItem = ({ item, level = 0 }: { item: NavigationItem; level?: number }) => {
    const isActive = pathname === item.href || 
                    (item.children && item.children.some(child => pathname.startsWith(child.href)))
    const isCurrentPage = pathname === item.href
    const isExpanded = expandedItems.includes(item.name)
    const hasChildren = item.children && item.children.length > 0
    
    return (
      <li className={cn(
        'group relative',
        'animate-slideInLeft',
        level === 0 ? 'mb-1' : 'mb-0.5'
      )}>
        <div className="flex items-center relative">
          {/* Active indicator */}
          {isCurrentPage && (
            <div className="absolute left-0 w-1 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-r-full shadow-md"></div>
          )}
          
          <Link
            href={item.href}
            className={cn(
              'flex items-center flex-1 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 group relative overflow-hidden',
              level > 0 ? 'ml-4 pl-6' : 'ml-2',
              isCurrentPage
                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-md border border-blue-100'
                : isActive
                ? 'bg-gradient-to-r from-blue-25 to-indigo-25 text-blue-600'
                : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:text-gray-900 hover:shadow-sm'
            )}
            onClick={() => {
              if (window.innerWidth < 1024) {
                setSidebarOpen(false)
              }
            }}
          >
            {/* Hover effect overlay */}
            <div className={cn(
              'absolute inset-0 bg-gradient-to-r from-blue-100 to-indigo-100 opacity-0 group-hover:opacity-50 transition-opacity duration-300',
              isCurrentPage && 'opacity-30'
            )}></div>
            
            <item.icon className={cn(
              'mr-3 transition-all duration-300 relative z-10',
              level > 0 ? 'h-4 w-4' : 'h-5 w-5',
              isCurrentPage 
                ? 'text-blue-600 drop-shadow-sm' 
                : 'group-hover:scale-110 group-hover:text-blue-500'
            )} />
            
            <span className={cn(
              'relative z-10 transition-colors duration-300',
              isCurrentPage && 'font-semibold'
            )}>
              {item.name}
            </span>
            
            {/* Badge */}
            {item.badge && (
              <span className={cn(
                'ml-auto px-2 py-0.5 text-xs font-bold rounded-full transition-all duration-300 relative z-10',
                typeof item.badge === 'number'
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-sm'
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm'
              )}>
                {item.badge}
              </span>
            )}
          </Link>
          
          {hasChildren && (
            <button
              onClick={() => toggleExpanded(item.name)}
              className={cn(
                'p-1.5 mr-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-300 group',
                isExpanded && 'text-blue-500 bg-blue-50'
              )}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
              ) : (
                <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
              )}
            </button>
          )}
        </div>
        
        {/* Children menu with animation */}
        {hasChildren && (
          <div className={cn(
            'overflow-hidden transition-all duration-300 ease-in-out',
            isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          )}>
            <ul className="mt-1 space-y-0.5 pl-4 border-l-2 border-gray-100 ml-4">
              {item.children!.map((child, index) => (
                <div
                  key={child.name}
                  className="animate-slideInLeft"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <NavigationItem item={child} level={level + 1} />
                </div>
              ))}
            </ul>
          </div>
        )}
      </li>
    )
  }

  return (
    <>
      {/* Mobile sidebar backdrop */}
      <div className={cn(
        'fixed inset-0 z-40 lg:hidden transition-opacity duration-300',
        sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      )}>
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" 
          onClick={() => setSidebarOpen(false)} 
        />
        
        {/* Mobile sidebar */}
        <div className={cn(
          'relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-2xl transition-transform duration-300 ease-in-out transform',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}>
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 transition-all duration-300"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white drop-shadow-lg" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <SidebarContent 
              navigation={filteredNavigation} 
              NavigationItem={NavigationItem} 
              session={session}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0 lg:fixed lg:inset-y-0 lg:z-30">
        <div className="flex flex-col w-72">
          <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200 shadow-xl">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <SidebarContent 
                navigation={filteredNavigation} 
                NavigationItem={NavigationItem} 
                session={session}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          className="p-3 rounded-xl bg-white shadow-lg border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 hover:scale-105 hover:shadow-xl"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </>
  )
}

interface SidebarContentProps {
  navigation: NavigationItem[]
  NavigationItem: React.ComponentType<{ item: NavigationItem; level?: number }>
  session: Session | null
  searchQuery: string
  setSearchQuery: (query: string) => void
}

function SidebarContent({ navigation, NavigationItem, session, searchQuery, setSearchQuery }: SidebarContentProps) {
  return (
    <>
      {/* Header */}
      <div className="flex items-center flex-shrink-0 px-4 mb-6">
        <div className="flex items-center w-full">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
            <Store className="h-7 w-7 text-white" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              E-Commerce
            </p>
            <p className="text-xs text-gray-500 font-medium">
              Dashboard Pro
            </p>
          </div>
          <div className="flex items-center space-x-1">
            <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-300">
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search navigation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-300"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* User info */}
      <div className="px-4 mb-6">
        <div className="flex items-center p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-100">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-sm">
            <User className="h-5 w-5 text-white" />
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {session?.user?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 font-medium">
              {session?.user && 'role' in session.user ? session.user.role : 'USER'}
            </p>
          </div>
          <button
            onClick={() => signOut()}
            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all duration-300 group"
            title="Sign out"
          >
            <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4">
        <div className="space-y-1">
          {navigation.length > 0 ? (
            navigation.map((item, index) => (
              <div
                key={item.name}
                className="animate-slideInLeft"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <NavigationItem item={item} />
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No items found</p>
            </div>
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-xs text-gray-400">
            © 2024 E-Commerce Dashboard
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Version 1.0.0
          </p>
        </div>
      </div>
    </>
  )
}