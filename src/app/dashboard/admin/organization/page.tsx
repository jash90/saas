import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { getUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Building2, Users, Package, Settings, Calendar, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function AdminOrganizationPage() {
  const user = await getUser()
  const supabase = await createClient()

  if (!user?.organization_id) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No organization found</h3>
          <p className="mt-1 text-sm text-gray-500">
            You need to be assigned to an organization to manage settings.
          </p>
        </div>
      </DashboardLayout>
    )
  }

  // Get organization details
  const { data: organization } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', user.organization_id)
    .single()

  // Get organization statistics
  const { data: totalUsers } = await supabase
    .from('users')
    .select('id', { count: 'exact' })
    .eq('organization_id', user.organization_id)

  const { data: activeModules } = await supabase
    .from('organization_modules')
    .select('id', { count: 'exact' })
    .eq('organization_id', user.organization_id)
    .eq('is_active', true)

  const { data: modulesCost } = await supabase
    .from('organization_modules')
    .select(`
      modules (price)
    `)
    .eq('organization_id', user.organization_id)
    .eq('is_active', true)

  const totalCost = modulesCost?.reduce((sum, item) => {
    const modules = item.modules as unknown as { price: number } | null
    return sum + (modules?.price || 0)
  }, 0) || 0

  const stats = [
    {
      name: 'Team Members',
      value: totalUsers?.length || 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: 'Active Modules',
      value: activeModules?.length || 0,
      icon: Package,
      color: 'bg-green-500',
    },
    {
      name: 'Monthly Cost',
      value: `$${totalCost.toFixed(2)}`,
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
  ]

  const quickActions = [
    {
      name: 'Invite Employees',
      description: 'Add new team members to your organization',
      icon: Users,
      color: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
      href: '/dashboard/admin/employees',
    },
    {
      name: 'Manage Modules',
      description: 'Purchase and configure organization modules',
      icon: Package,
      color: 'bg-green-50 text-green-700 hover:bg-green-100',
      href: '/dashboard/admin/modules',
    },
    {
      name: 'Organization Settings',
      description: 'Update organization profile and preferences',
      icon: Settings,
      color: 'bg-purple-50 text-purple-700 hover:bg-purple-100',
      href: '#settings',
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Organization</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage your organization profile and settings.
            </p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>

        {/* Organization Overview */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-bold text-gray-900">{organization?.name}</h2>
                <p className="text-sm text-gray-500">/{organization?.slug}</p>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Created {organization?.created_at ? new Date(organization.created_at).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
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

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {quickActions.map((action) => {
                const IconComponent = action.icon
                return (
                  <div
                    key={action.name}
                    className={`relative rounded-lg border border-gray-200 p-6 cursor-pointer transition-colors ${action.color}`}
                  >
                    <div className="flex items-center">
                      <IconComponent className="h-8 w-8" />
                      <div className="ml-4">
                        <h4 className="text-lg font-medium">{action.name}</h4>
                        <p className="mt-2 text-sm opacity-90">{action.description}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Admin Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Administrator</h3>
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-900">
                  {user.full_name}
                </div>
                <div className="text-sm text-gray-500">
                  {user.email}
                </div>
                <div className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Administrator
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