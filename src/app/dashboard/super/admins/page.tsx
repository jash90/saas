import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { createClient } from '@/lib/supabase/server'
import { Users, Building2, Calendar, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AdminWithOrganization {
  id: string
  email: string
  full_name: string
  role: string
  created_at: string
  organization_id: string | null
  organizations: {
    id: string
    name: string
    slug: string
    created_at: string
  } | null
}

export default async function SuperAdminsPage() {
  const supabase = await createClient()

  // Get all admins with their organizations
  const { data: admins } = await supabase
    .from('users')
    .select(`
      *,
      organizations (*)
    `)
    .eq('role', 'admin')
    .order('created_at', { ascending: false }) as { data: AdminWithOrganization[] | null }

  // Get statistics
  const { data: totalAdmins } = await supabase
    .from('users')
    .select('id', { count: 'exact' })
    .eq('role', 'admin')

  const { data: activeOrganizations } = await supabase
    .from('organizations')
    .select('id', { count: 'exact' })

  // Get recent signups (last 7 days)
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  
  const { data: recentSignups } = await supabase
    .from('users')
    .select('id', { count: 'exact' })
    .eq('role', 'admin')
    .gte('created_at', weekAgo.toISOString())

  const stats = [
    {
      name: 'Total Admins',
      value: totalAdmins?.length || 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: 'Active Organizations',
      value: activeOrganizations?.length || 0,
      icon: Building2,
      color: 'bg-green-500',
    },
    {
      name: 'Recent Signups',
      value: recentSignups?.length || 0,
      icon: Calendar,
      color: 'bg-purple-500',
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Management</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage all system administrators and their organizations.
            </p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Shield className="h-4 w-4 mr-2" />
            Add Admin
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

        {/* Admins Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              System Administrators ({admins?.length || 0})
            </h3>
            
            {admins && admins.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Admin
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Organization
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {admins.map((admin) => (
                      <tr key={admin.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <Users className="h-5 w-5 text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {admin.full_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {admin.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {admin.organizations ? (
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {admin.organizations.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                /{admin.organizations.slug}
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">No organization</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(admin.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                            <Button variant="destructive" size="sm">
                              Disable
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No administrators</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating your first admin user.
                </p>
                <div className="mt-6">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Shield className="h-4 w-4 mr-2" />
                    Add Admin
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