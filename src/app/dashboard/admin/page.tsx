import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { getUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Users, Package, Building, TrendingUp } from 'lucide-react'

interface ModuleData {
  id: string
  modules?: {
    name: string
    price: number
  } | null
}

export default async function AdminDashboard() {
  const user = await getUser()
  const supabase = await createClient()

  // Get organization and related data
  const { data: organization } = await supabase
    .from('organizations')
    .select('*')
    .eq('admin_id', user?.id)
    .single()

  const [
    { count: employeeCount },
    { count: moduleCount },
    { data: purchasedModules }
  ] = await Promise.all([
    supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organization?.id),
    supabase
      .from('organization_modules')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organization?.id)
      .eq('is_active', true),
    supabase
      .from('organization_modules')
      .select(`
        *,
        modules (*)
      `)
      .eq('organization_id', organization?.id)
      .eq('is_active', true)
  ])

  const totalCost = (purchasedModules as ModuleData[])?.reduce((sum, om) => {
    return sum + (om.modules?.price || 0)
  }, 0) || 0

  const stats = [
    {
      name: 'Employees',
      value: employeeCount || 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: 'Active Modules',
      value: moduleCount || 0,
      icon: Package,
      color: 'bg-green-500',
    },
    {
      name: 'Monthly Cost',
      value: `$${totalCost.toFixed(2)}`,
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
    {
      name: 'Organization',
      value: organization ? '1' : '0',
      icon: Building,
      color: 'bg-orange-500',
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Welcome back, {user?.full_name}. Manage your organization and employees.
          </p>
          {organization && (
            <p className="text-sm text-gray-500">
              Organization: <span className="font-medium">{organization.name}</span>
            </p>
          )}
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
                {!organization ? (
                  <a
                    href="/dashboard/admin/organization"
                    className="block p-3 border border-yellow-200 bg-yellow-50 rounded-lg hover:bg-yellow-100"
                  >
                    <div className="flex items-center">
                      <Building className="h-5 w-5 text-yellow-600 mr-3" />
                      <span className="text-sm font-medium text-yellow-900">
                        Set up Organization (Required)
                      </span>
                    </div>
                  </a>
                ) : (
                  <>
                    <a
                      href="/dashboard/admin/employees"
                      className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <Users className="h-5 w-5 text-blue-500 mr-3" />
                        <span className="text-sm font-medium text-gray-900">
                          Manage Employees
                        </span>
                      </div>
                    </a>
                    <a
                      href="/dashboard/admin/modules"
                      className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <Package className="h-5 w-5 text-purple-500 mr-3" />
                        <span className="text-sm font-medium text-gray-900">
                          Purchase Modules
                        </span>
                      </div>
                    </a>
                    <a
                      href="/dashboard/admin/organization"
                      className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <Building className="h-5 w-5 text-green-500 mr-3" />
                        <span className="text-sm font-medium text-gray-900">
                          Organization Settings
                        </span>
                      </div>
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Recent Modules
              </h3>
              <div className="space-y-3">
                {purchasedModules && purchasedModules.length > 0 ? (
                  (purchasedModules as ModuleData[]).slice(0, 3).map((om) => (
                    <div key={om.id} className="flex items-center justify-between">
                      <span className="text-sm text-gray-900">{om.modules?.name}</span>
                      <span className="text-sm text-gray-500">${om.modules?.price}/month</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No modules purchased yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 