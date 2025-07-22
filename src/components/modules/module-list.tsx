'use client'

import { Module } from '@/lib/database.types'
import { Package, DollarSign, ToggleLeft, ToggleRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface ModuleListProps {
  modules: Module[]
}

export function ModuleList({ modules }: ModuleListProps) {
  const router = useRouter()
  const supabase = createClient()
  const [updating, setUpdating] = useState<string | null>(null)

  const toggleModuleStatus = async (moduleId: string, currentStatus: boolean) => {
    setUpdating(moduleId)
    try {
      const { error } = await supabase
        .from('modules')
        .update({ is_active: !currentStatus })
        .eq('id', moduleId)

      if (error) {
        console.error('Error updating module:', error)
        return
      }

      router.refresh()
    } catch (error) {
      console.error('Error updating module:', error)
    } finally {
      setUpdating(null)
    }
  }

  if (modules.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No modules</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating your first module.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          System Modules ({modules.length})
        </h3>
        <div className="space-y-4">
          {modules.map((module) => (
            <div
              key={module.id}
              className={`border rounded-lg p-4 ${
                module.is_active 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <h4 className="text-lg font-medium text-gray-900">
                      {module.name}
                    </h4>
                    <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      module.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {module.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    {module.description}
                  </p>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <DollarSign className="h-4 w-4 mr-1" />
                    <span className="font-medium">${module.price}/month</span>
                  </div>
                  {module.features && module.features.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 font-medium">Features:</p>
                      <ul className="mt-1 text-sm text-gray-500 list-disc list-inside">
                        {module.features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="ml-4 flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleModuleStatus(module.id, module.is_active)}
                    disabled={updating === module.id}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {module.is_active ? (
                      <ToggleRight className="h-5 w-5 text-green-500" />
                    ) : (
                      <ToggleLeft className="h-5 w-5 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 