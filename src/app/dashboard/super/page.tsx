import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { getUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Users, Shield, Package, Building } from 'lucide-react'

export default async function SuperUserDashboard() {
  const user = await getUser()
  const supabase = await createClient()

  // Get counts for dashboard stats
  const [
    { count: adminCount },
    { count: organizationCount },
    { count: moduleCount },
    { count: employeeCount }
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
    supabase.from('organizations').select('*', { count: 'exact', head: true }),
    supabase.from('modules').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'employee')
  ])

  const stats = [
    {
      name: 'Total Admins',
      value: adminCount || 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: 'Organizations',
      value: organizationCount || 0,
      icon: Building,
      color: 'bg-green-500',
    },
    {
      name: 'Available Modules',
      value: moduleCount || 0,
      icon: Package,
      color: 'bg-purple-500',
    },
    {
      name: 'Total Employees',
      value: employeeCount || 0,
      icon: Shield,
      color: 'bg-orange-500',
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Super User Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Welcome back, {user?.full_name}. Manage admins, modules, and system-wide settings.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => {
            const IconComponent = item.icon
            return (
              <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`${item.color} rounded-md p-3`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {item.name}
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {item.value}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <a
                  href="/dashboard/super/admins"
                  className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-blue-500 mr-3" />
                    <span className="text-sm font-medium text-gray-900">
                      Manage Admins
                    </span>
                  </div>
                </a>
                <a
                  href="/dashboard/super/modules"
                  className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <Package className="h-5 w-5 text-purple-500 mr-3" />
                    <span className="text-sm font-medium text-gray-900">
                      Manage Modules
                    </span>
                  </div>
                </a>
                <a
                  href="/dashboard/super/organizations"
                  className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <Building className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-sm font-medium text-gray-900">
                      View Organizations
                    </span>
                  </div>
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                System Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">System Status</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Online
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Connected
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Authentication</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 