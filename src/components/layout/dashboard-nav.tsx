'use client'

import { User } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { Settings, Shield, Users, Package, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface DashboardNavProps {
  user: User
}

export function DashboardNav({ user }: DashboardNavProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: `/dashboard/${user.role === 'super_user' ? 'super' : user.role}`, icon: Settings }
    ]

    if (user.role === 'super_user') {
      return [
        ...baseItems,
        { name: 'Admins', href: '/dashboard/super/admins', icon: Users },
        { name: 'Modules', href: '/dashboard/super/modules', icon: Package },
        { name: 'Organizations', href: '/dashboard/super/organizations', icon: Shield },
      ]
    }

    if (user.role === 'admin') {
      return [
        ...baseItems,
        { name: 'Employees', href: '/dashboard/admin/employees', icon: Users },
        { name: 'Modules', href: '/dashboard/admin/modules', icon: Package },
        { name: 'Organization', href: '/dashboard/admin/organization', icon: Settings },
      ]
    }

    return [
      ...baseItems,
      { name: 'My Modules', href: '/dashboard/employee/modules', icon: Package },
    ]
  }

  const navigationItems = getNavigationItems()

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                RBAC System
              </span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigationItems.map((item) => {
                const IconComponent = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm inline-flex items-center transition-colors"
                  >
                    <IconComponent className="h-4 w-4 mr-1" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center space-x-4">
                <div className="text-sm">
                  <p className="text-gray-900 font-medium">{user.full_name}</p>
                  <p className="text-gray-500 capitalize">{user.role.replace('_', ' ')}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
} 