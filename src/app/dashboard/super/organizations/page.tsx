import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { createClient } from '@/lib/supabase/server'
import { Building2, Users, Package, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface OrganizationWithDetails {
  id: string
  name: string
  slug: string
  created_at: string
  admin_id: string
  users: { id: string }[]
}

export default async function SuperOrganizationsPage() {
  const supabase = await createClient()

  // Get all organizations with user counts
  const { data: organizations } = await supabase
    .from('organizations')
    .select(`
      *,
      users!fk_users_organization (id)
    `)
    .order('created_at', { ascending: false }) as { data: OrganizationWithDetails[] | null }

  // Get organization statistics
  const { data: totalOrgs } = await supabase
    .from('organizations')
    .select('id', { count: 'exact' })

  const { data: totalEmployees } = await supabase
    .from('users')
    .select('id', { count: 'exact' })
    .neq('role', 'super_user')

  const { data: totalModules } = await supabase
    .from('organization_modules')
    .select('id', { count: 'exact' })
    .eq('is_active', true)

  const stats = [
    {
      name: 'Total Organizations',
      value: totalOrgs?.length || 0,
      icon: Building2,
      color: 'bg-blue-500',
    },
    {
      name: 'Total Users',
      value: totalEmployees?.length || 0,
      icon: Users,
      color: 'bg-green-500',
    },
    {
      name: 'Active Modules',
      value: totalModules?.length || 0,
      icon: Package,
      color: 'bg-purple-500',
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Organizations</h1>
            <p className="mt-2 text-sm text-gray-700">
              View and manage all organizations in the system.
            </p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Building2 className="h-4 w-4 mr-2" />
            Create Organization
          </Button>
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

        {/* Organizations List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              All Organizations ({organizations?.length || 0})
            </h3>
            
            {organizations && organizations.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {organizations.map((org) => (
                  <div key={org.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <h4 className="text-lg font-medium text-gray-900">{org.name}</h4>
                          <p className="text-sm text-gray-500">/{org.slug}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        <span>{org.users?.length || 0} users</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        <span>Created {new Date(org.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        Settings
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No organizations</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Organizations will appear here as admins sign up.
                </p>
                <div className="mt-6">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Building2 className="h-4 w-4 mr-2" />
                    Create Organization
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 