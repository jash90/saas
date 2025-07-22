import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { getUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Package, CheckCircle, Clock, Building } from 'lucide-react'

interface ModuleAccessData {
  id: string
  modules?: {
    name: string
    description: string
  } | null
}

interface OrganizationModuleData {
  id: string
  module_id: string
  modules?: {
    name: string
    description: string
  } | null
}

export default async function EmployeeDashboard() {
  const user = await getUser()
  const supabase = await createClient()

  // Get user's organization and module access
  const { data: employee } = await supabase
    .from('employees')
    .select(`
      *,
      organizations (*)
    `)
    .eq('user_id', user?.id)
    .single()

  const { data: moduleAccess } = await supabase
    .from('user_module_access')
    .select(`
      *,
      modules (*)
    `)
    .eq('user_id', user?.id)
    .eq('is_active', true)

  const { data: organizationModules } = await supabase
    .from('organization_modules')
    .select(`
      *,
      modules (*)
    `)
    .eq('organization_id', employee?.organization_id)
    .eq('is_active', true)

  const accessibleModules = (moduleAccess as ModuleAccessData[]) || []
  const availableModules = (organizationModules as OrganizationModuleData[]) || []

  const stats = [
    {
      name: 'Available Modules',
      value: availableModules.length,
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      name: 'Accessible Modules',
      value: accessibleModules.length,
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      name: 'Department',
      value: employee?.department || 'Not assigned',
      icon: Building,
      color: 'bg-purple-500',
    },
    {
      name: 'Position',
      value: employee?.position || 'Not assigned',
      icon: Clock,
      color: 'bg-orange-500',
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Welcome back, {user?.full_name}. Access your assigned modules and tools.
          </p>
          {employee?.organizations && (
            <p className="text-sm text-gray-500 mt-1">
              Organization: <span className="font-medium">{employee.organizations.name}</span>
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
                My Accessible Modules
              </h3>
              <div className="space-y-3">
                {accessibleModules.length > 0 ? (
                  accessibleModules.map((access) => (
                    <div
                      key={access.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                        <div>
                          <span className="text-sm font-medium text-gray-900 block">
                            {access.modules?.name}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {access.modules?.description}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-green-600 font-medium">
                        Active
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No modules assigned yet</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Organization Modules
              </h3>
              <div className="space-y-3">
                {availableModules.length > 0 ? (
                  availableModules.map((orgModule) => {
                    const hasAccess = accessibleModules.some(
                      (access) => access.modules && orgModule.modules && access.modules.name === orgModule.modules.name
                    )
                    return (
                      <div
                        key={orgModule.id}
                        className={`flex items-center justify-between p-3 border rounded-lg ${
                          hasAccess 
                            ? 'border-green-200 bg-green-50' 
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center">
                          <Package className={`h-5 w-5 mr-3 ${
                            hasAccess ? 'text-green-500' : 'text-gray-400'
                          }`} />
                          <div>
                            <span className={`text-sm font-medium block ${
                              hasAccess ? 'text-gray-900' : 'text-gray-500'
                            }`}>
                              {orgModule.modules?.name}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              {orgModule.modules?.description}
                            </p>
                          </div>
                        </div>
                        <span className={`text-xs font-medium ${
                          hasAccess ? 'text-green-600' : 'text-gray-400'
                        }`}>
                          {hasAccess ? 'Accessible' : 'Not Assigned'}
                        </span>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-sm text-gray-500">No modules available in your organization</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 