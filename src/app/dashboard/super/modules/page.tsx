import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { createClient } from '@/lib/supabase/server'
import { ModuleList } from '@/components/modules/module-list'
import { CreateModuleForm } from '@/components/modules/create-module-form'

export default async function ModulesPage() {
  const supabase = await createClient()

  const { data: modules, error: modulesError } = await supabase
    .from('modules')
    .select('*')
    .order('created_at', { ascending: false })

  // Debug logging
  console.log('Super user modules:', modules)
  console.log('Super user modules error:', modulesError)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Module Management</h1>
            <p className="mt-2 text-sm text-gray-700">
              Create and manage system modules that organizations can purchase.
            </p>
          </div>
        </div>

        {/* Debug Info */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-800 mb-2">Super User Debug Information</h3>
          <div className="text-sm text-green-700">
            <p>Total modules in system: {modules?.length || 0}</p>
            {modulesError && <p className="text-red-600">Error: {modulesError.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ModuleList modules={modules || []} />
          </div>
          <div>
            <CreateModuleForm />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 