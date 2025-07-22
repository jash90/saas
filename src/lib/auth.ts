import { createClient } from '@/lib/supabase/server'
import { User, UserRole } from '@/lib/database.types'

export async function getUser(): Promise<User | null> {
  const supabase = await createClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null

    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    return userData
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

export function hasRole(user: User | null, role: UserRole): boolean {
  if (!user) return false
  return user.role === role
}

export function hasAnyRole(user: User | null, roles: UserRole[]): boolean {
  if (!user) return false
  return roles.includes(user.role)
}

export function canAccessAdminFeatures(user: User | null): boolean {
  return hasAnyRole(user, ['super_user', 'admin'])
}

export function canAccessSuperUserFeatures(user: User | null): boolean {
  return hasRole(user, 'super_user')
} 