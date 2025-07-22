import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { getUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Package, Lock, CheckCircle, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ModuleWithAccess {
  id: string
  name: string
  description: string
  price: number
  features: string[]
  is_active: boolean
}

interface UserModuleAccess {
  module_id: string
  granted_at: string
  is_active: boolean
  modules: ModuleWithAccess
}

interface OrganizationModule {
  modules: ModuleWithAccess
}

export default async function EmployeeModulesPage() {
  const user = await getUser()
  const supabase = await createClient()

  if (!user?.organization_id) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No organization found</h3>
          <p className="mt-1 text-sm text-gray-500">
            You need to be assigned to an organization to access modules.
          </p>
        </div>
      </DashboardLayout>
    )
  }

  // Get organization details
  const { data: organization, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', user.organization_id)
    .single()

  // Get user's accessible modules
  const { data: userModules, error: userModulesError } = await supabase
    .from('user_module_access')
    .select(`
      *,
      modules!inner (*)
    `)
    .eq('user_id', user.id)
    .eq('is_active', true)

  // Get all organization modules  
  const { data: orgModules, error: orgModulesError } = await supabase
    .from('organization_modules')
    .select(`
      *,
      modules!inner (*)
    `)
    .eq('organization_id', user.organization_id)
    .eq('is_active', true)

  const userModuleIds = new Set(userModules?.map((um: UserModuleAccess) => um.module_id) || [])
  const accessibleModules = userModules?.map((um: UserModuleAccess) => um.modules) || []
  const organizationModules = orgModules?.map((om: OrganizationModule) => om.modules) || []

  // Filter out modules that user already has access to
  const availableModules = organizationModules.filter((module: ModuleWithAccess) => 
    !userModuleIds.has(module.id)
  )

  // Debug logging
  console.log('Employee accessible modules:', userModules)
  console.log('Organization modules:', orgModules)
  console.log('Available modules for request:', availableModules)
  console.log('Organization data:', organization)
  console.log('User organization_id:', user?.organization_id)

  const stats = [
    {
      name: 'My Modules',
      value: accessibleModules.length,
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      name: 'Organization Modules',
      value: organizationModules.length,
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      name: 'Pending Access',
      value: availableModules.length,
      icon: Lock,
      color: 'bg-yellow-500',
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Modules</h1>
            <p className="mt-2 text-sm text-gray-700">
              Access your assigned modules and view available organization modules.
            </p>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Building2 className="h-4 w-4 mr-1" />
            <span>{organization?.name}</span>
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


        {/* Accessible Modules */}
        {accessibleModules && accessibleModules.length > 0 && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                My Accessible Modules ({accessibleModules.length})
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {accessibleModules.map((module) => (
                  <div key={module.id} className="border border-green-200 bg-green-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="ml-3">
                          <h4 className="text-lg font-medium text-gray-900">{module.name}</h4>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{module.description}</p>
                    
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {module.features.map((feature: string, idx: number) => (
                          <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      Launch Module
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Available Organization Modules */}
        {availableModules && availableModules.length > 0 && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Organization Modules ({availableModules.length})
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                These modules are available to your organization but you dont have access yet. 
                Contact your administrator to request access.
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {availableModules.map((module) => (
                  <div key={module.id} className="border border-gray-200 bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Lock className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="ml-3">
                          <h4 className="text-lg font-medium text-gray-900">{module.name}</h4>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            No Access
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{module.description}</p>
                    
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {module.features.map((feature: string, idx: number) => (
                          <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    <Button variant="outline" className="w-full" disabled>
                      <Lock className="h-4 w-4 mr-2" />
                      Request Access
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* No modules state */}
        {(!accessibleModules || accessibleModules.length === 0) && 
         (!availableModules || availableModules.length === 0) && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No modules available</h3>
            <p className="mt-1 text-sm text-gray-500">
              Your organization hasn&apos;t purchased any modules yet, or you haven&apos;t been given access.
              Contact your administrator for more information.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
} 