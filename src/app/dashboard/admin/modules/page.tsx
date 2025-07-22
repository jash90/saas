import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { getUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Package, ShoppingCart, DollarSign, Users, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ModuleData {
  id: string
  name: string
  description: string
  price: number
  features: string[]
  is_active: boolean
}

interface OrganizationModule {
  id: string
  purchased_at: string
  is_active: boolean
  modules: ModuleData
}

export default async function AdminModulesPage() {
  const user = await getUser()
  const supabase = await createClient()

  // Get admin's organization
  const { data: adminData } = await supabase
    .from('users')
    .select(`
      *,
      organizations!inner (*)
    `)
    .eq('id', user?.id)
    .single()

  if (!adminData?.organizations) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No organization found</h3>
          <p className="mt-1 text-sm text-gray-500">
            You need to be assigned to an organization to manage modules.
          </p>
        </div>
      </DashboardLayout>
    )
  }

  // Get all available modules from modules table
  const { data: availableModules, error: modulesError } = await supabase
    .from('modules')
    .select('*')
    .eq('is_active', true)
    .order('name')

  // Debug logging
  console.log('Available modules:', availableModules)
  console.log('Modules error:', modulesError)

  // Get purchased modules for this organization
  const { data: purchasedModules } = await supabase
    .from('organization_modules')
    .select(`
      *,
      modules!inner (*)
    `)
    .eq('organization_id', adminData.organizations.id)
    .eq('is_active', true) as { data: OrganizationModule[] | null }

  const purchasedModuleIds = new Set(purchasedModules?.map((pm: OrganizationModule) => pm.modules.id) || [])
  
  const totalSpent = purchasedModules?.reduce((sum: number, pm: OrganizationModule) => sum + Number(pm.modules.price), 0) || 0

  const stats = [
    {
      name: 'Available Modules',
      value: availableModules?.length || 0,
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      name: 'Purchased Modules',
      value: purchasedModules?.length || 0,
      icon: ShoppingCart,
      color: 'bg-green-500',
    },
    {
      name: 'Monthly Cost',
      value: `$${totalSpent.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-purple-500',
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Module Management</h1>
            <p className="mt-2 text-sm text-gray-700">
              Purchase and manage modules for {adminData.organizations.name}.
            </p>
          </div>
        </div>

        {/* Debug Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Debug Information</h3>
          <div className="text-sm text-blue-700">
            <p>Total modules in database: {availableModules?.length || 0}</p>
            <p>Purchased modules: {purchasedModules?.length || 0}</p>
            <p>Organization ID: {adminData.organizations.id}</p>
            {modulesError && <p className="text-red-600">Error: {modulesError.message}</p>}
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

        {/* Purchased Modules */}
        {purchasedModules && purchasedModules.length > 0 && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Active Modules ({purchasedModules.length})
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {purchasedModules.map((pm) => (
                  <div key={pm.id} className="border border-green-200 bg-green-50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h4 className="text-lg font-medium text-gray-900">
                            {pm.modules.name}
                          </h4>
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          {pm.modules.description}
                        </p>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <DollarSign className="h-4 w-4 mr-1" />
                          <span className="font-medium">${pm.modules.price}/month</span>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 mb-1">Features:</p>
                          <div className="flex flex-wrap gap-1">
                            {pm.modules.features.map((feature, idx) => (
                              <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        Purchased {new Date(pm.purchased_at).toLocaleDateString()}
                      </span>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Users className="h-4 w-4 mr-1" />
                          Assign Users
                        </Button>
                        <Button variant="destructive" size="sm">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Available Modules */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Available Modules
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {availableModules?.map((module) => {
                const isPurchased = purchasedModuleIds.has(module.id)
                return (
                  <div key={module.id} className={`border rounded-lg p-4 ${
                    isPurchased 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h4 className="text-lg font-medium text-gray-900">
                            {module.name}
                          </h4>
                          {isPurchased && (
                            <Check className="ml-2 h-5 w-5 text-green-500" />
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          {module.description}
                        </p>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <DollarSign className="h-4 w-4 mr-1" />
                          <span className="font-medium">${module.price}/month</span>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 mb-1">Features:</p>
                          <div className="flex flex-wrap gap-1">
                            {module.features.map((feature: string, idx: number) => (
                              <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      {isPurchased ? (
                        <Button variant="outline" className="w-full" disabled>
                          <Check className="h-4 w-4 mr-2" />
                          Purchased
                        </Button>
                      ) : (
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Purchase Module
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* All Modules from Database */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              All Modules from Database ({availableModules?.length || 0})
            </h3>
            {availableModules && availableModules.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {availableModules.map((module) => {
                  const isPurchased = purchasedModuleIds.has(module.id)
                  return (
                    <div key={module.id} className={`border rounded-lg p-4 ${
                      isPurchased 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200 bg-white hover:border-blue-300'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h4 className="text-lg font-medium text-gray-900">
                              {module.name}
                            </h4>
                            {isPurchased && (
                              <Check className="ml-2 h-5 w-5 text-green-500" />
                            )}
                          </div>
                          <p className="mt-1 text-sm text-gray-600">
                            {module.description}
                          </p>
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <DollarSign className="h-4 w-4 mr-1" />
                            <span className="font-medium">${module.price}/month</span>
                          </div>
                          <div className="mt-2">
                            <p className="text-xs text-gray-500 mb-1">Features:</p>
                            <div className="flex flex-wrap gap-1">
                              {module.features?.map((feature: string, idx: number) => (
                                <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                                  {feature}
                                </span>
                              )) || []}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        {isPurchased ? (
                          <Button variant="outline" className="w-full" disabled>
                            <Check className="h-4 w-4 mr-2" />
                            Purchased
                          </Button>
                        ) : (
                          <Button className="w-full bg-blue-600 hover:bg-blue-700">
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Purchase Module
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No modules found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {modulesError ? `Error: ${modulesError.message}` : 'No active modules in the database.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {(!availableModules || availableModules.length === 0) && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No modules available</h3>
            <p className="mt-1 text-sm text-gray-500">
              There are currently no modules available for purchase.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
} 