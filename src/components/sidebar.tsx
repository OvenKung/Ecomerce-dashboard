'use client'

import { useState } from 'react'
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
  Store
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
    children: [
      { name: 'All Orders', href: '/dashboard/orders', icon: ShoppingCart },
      { name: 'Pending', href: '/dashboard/orders?status=pending', icon: ShoppingCart },
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
    permission: 'settings.view',
  },
]

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const pathname = usePathname()
  const { data: session } = useSession()

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }

  const filteredNavigation = navigation.filter(item => {
    if (!item.permission) return true
    return session?.user?.role && canAccess(session.user.role as any, item.permission)
  })

  const NavigationItem = ({ item, level = 0 }: { item: NavigationItem; level?: number }) => {
    const isActive = pathname === item.href || (item.children && item.children.some(child => pathname === child.href))
    const isExpanded = expandedItems.includes(item.name)
    const hasChildren = item.children && item.children.length > 0
    
    return (
      <li>
        <div className="flex items-center">
          <Link
            href={item.href}
            className={cn(
              'flex items-center flex-1 px-2 py-2 text-sm font-medium rounded-md transition-colors',
              level > 0 ? 'ml-4 pl-4' : '',
              isActive
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <item.icon className={cn('mr-3 h-5 w-5', level > 0 ? 'h-4 w-4' : '')} />
            {item.name}
          </Link>
          {hasChildren && (
            <button
              onClick={() => toggleExpanded(item.name)}
              className="p-1 mr-2 text-gray-400 hover:text-gray-600"
            >
              <ChevronDown className={cn('h-4 w-4 transition-transform', isExpanded ? 'rotate-180' : '')} />
            </button>
          )}
        </div>
        {hasChildren && isExpanded && (
          <ul className="mt-1 space-y-1">
            {item.children!.map((child) => (
              <NavigationItem key={child.name} item={child} level={level + 1} />
            ))}
          </ul>
        )}
      </li>
    )
  }

  return (
    <>
      {/* Mobile sidebar */}
      <div className={cn(
        'fixed inset-0 z-40 lg:hidden',
        sidebarOpen ? 'block' : 'hidden'
      )}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <SidebarContent navigation={filteredNavigation} NavigationItem={NavigationItem} session={session} />
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0 lg:fixed lg:inset-y-0 lg:z-30">
        <div className="flex flex-col w-72">
          <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <SidebarContent navigation={filteredNavigation} NavigationItem={NavigationItem} session={session} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>
    </>
  )
}

interface SidebarContentProps {
  navigation: NavigationItem[]
  NavigationItem: React.ComponentType<{ item: NavigationItem; level?: number }>
  session: Session | null
}

function SidebarContent({ navigation, NavigationItem, session }: SidebarContentProps) {
  return (
    <>
      <div className="flex items-center flex-shrink-0 px-4 mb-6">
        <div className="flex items-center">
          <Store className="h-8 w-8 text-indigo-600" />
          <div className="ml-3">
            <p className="text-lg font-semibold text-gray-900">Dashboard</p>
            <p className="text-xs text-gray-500">
              {session?.user?.name} ({session?.user && 'role' in session.user ? session.user.role : 'USER'})
            </p>
          </div>
        </div>
      </div>
      <nav className="mt-8 flex-1 px-4">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <NavigationItem key={item.name} item={item} />
          ))}
        </ul>
      </nav>
    </>
  )
}