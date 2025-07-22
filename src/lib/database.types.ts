export type UserRole = 'super_user' | 'admin' | 'employee'

export interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  created_at: string
  updated_at: string
  organization_id?: string
}

export interface Organization {
  id: string
  name: string
  slug: string
  created_at: string
  updated_at: string
  admin_id: string
}

export interface Module {
  id: string
  name: string
  description: string
  price: number
  is_active: boolean
  created_at: string
  updated_at: string
  features: string[]
}

export interface OrganizationModule {
  id: string
  organization_id: string
  module_id: string
  purchased_at: string
  is_active: boolean
}

export interface Employee {
  id: string
  user_id: string
  organization_id: string
  position: string
  department: string
  created_at: string
  updated_at: string
}

export interface UserModuleAccess {
  id: string
  user_id: string
  module_id: string
  granted_at: string
  is_active: boolean
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<User, 'id' | 'created_at'>>
      }
      organizations: {
        Row: Organization
        Insert: Omit<Organization, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Organization, 'id' | 'created_at'>>
      }
      modules: {
        Row: Module
        Insert: Omit<Module, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Module, 'id' | 'created_at'>>
      }
      organization_modules: {
        Row: OrganizationModule
        Insert: Omit<OrganizationModule, 'id'>
        Update: Partial<Omit<OrganizationModule, 'id'>>
      }
      employees: {
        Row: Employee
        Insert: Omit<Employee, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Employee, 'id' | 'created_at'>>
      }
      user_module_access: {
        Row: UserModuleAccess
        Insert: Omit<UserModuleAccess, 'id'>
        Update: Partial<Omit<UserModuleAccess, 'id'>>
      }
    }
  }
} 