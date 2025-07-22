import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { getUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Users, UserPlus, Mail, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmployeeWithModules {
  id: string
  email: string
  full_name: string
  role: string
  created_at: string
  user_module_access?: { module_id: string }[]
}

export default async function AdminEmployeesPage() {
  const user = await getUser()
  const supabase = await createClient()

  if (!user?.organization_id) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No organization found</h3>
          <p className="mt-1 text-sm text-gray-500">
            You need to be assigned to an organization to manage employees.
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

  // Get all employees in the organization (including admin)
  const { data: employees } = await supabase
    .from('users')
    .select(`
      *,
      user_module_access (module_id)
    `)
    .eq('organization_id', user.organization_id)
    .order('created_at', { ascending: false }) as { data: EmployeeWithModules[] | null }

  // Get employee statistics
  const { data: totalEmployees } = await supabase
    .from('users')
    .select('id', { count: 'exact' })
    .eq('organization_id', user.organization_id)
    .eq('role', 'employee')

  const { data: allUsers } = await supabase
    .from('users')
    .select('id', { count: 'exact' })
    .eq('organization_id', user.organization_id)

  const { data: activeModules } = await supabase
    .from('user_module_access')
    .select('module_id', { count: 'exact' })
    .eq('is_active', true)

  const stats = [
    {
      name: 'Total Team Members',
      value: allUsers?.length || 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: 'Employees',
      value: totalEmployees?.length || 0,
      icon: UserPlus,
      color: 'bg-green-500',
    },
    {
      name: 'Module Access',
      value: activeModules?.length || 0,
      icon: Package,
      color: 'bg-purple-500',
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage employees and team members for{' '}
              <span className="font-medium">{organization?.name}</span>.
            </p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Mail className="h-4 w-4 mr-2" />
            Invite Employee
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

        {/* Team Members List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Team Members ({employees?.length || 0})
            </h3>
            
            {employees && employees.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Module Access
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {employees.map((employee) => (
                      <tr key={employee.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                employee.role === 'admin' ? 'bg-blue-100' : 'bg-green-100'
                              }`}>
                                <Users className={`h-5 w-5 ${
                                  employee.role === 'admin' ? 'text-blue-600' : 'text-green-600'
                                }`} />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {employee.full_name}
                                {employee.id === user.id && (
                                  <span className="ml-2 text-xs text-gray-500">(You)</span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">
                                {employee.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            employee.role === 'admin' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {employee.role === 'admin' ? 'Administrator' : 'Employee'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {employee.user_module_access?.length || 0} modules
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(employee.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                            {employee.role === 'employee' && (
                              <>
                                <Button variant="outline" size="sm">
                                  Assign Modules
                                </Button>
                                <Button variant="destructive" size="sm">
                                  Remove
                                </Button>
                              </>
                            )}
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
                <h3 className="mt-2 text-sm font-medium text-gray-900">No team members</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by inviting employees to your organization.
                </p>
                <div className="mt-6">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Mail className="h-4 w-4 mr-2" />
                    Invite Employee
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