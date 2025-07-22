-- Enable RLS on auth.users
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create user_roles enum
CREATE TYPE user_role AS ENUM ('super_user', 'admin', 'employee');

-- Create users table (extending auth.users with custom fields)
CREATE TABLE public.users (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text NOT NULL UNIQUE,
  full_name text NOT NULL,
  role user_role NOT NULL DEFAULT 'admin',
  organization_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create organizations table
CREATE TABLE public.organizations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  admin_id uuid REFERENCES public.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create modules table
CREATE TABLE public.modules (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  price decimal(10,2) NOT NULL,
  is_active boolean DEFAULT true,
  features text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create organization_modules table (purchased modules)
CREATE TABLE public.organization_modules (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  module_id uuid REFERENCES public.modules(id) ON DELETE CASCADE,
  purchased_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  UNIQUE(organization_id, module_id)
);

-- Create employees table
CREATE TABLE public.employees (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  position text,
  department text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, organization_id)
);

-- Create user_module_access table
CREATE TABLE public.user_module_access (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  module_id uuid REFERENCES public.modules(id) ON DELETE CASCADE,
  granted_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  UNIQUE(user_id, module_id)
);

-- Add foreign key constraint for organization_id in users table
ALTER TABLE public.users ADD CONSTRAINT fk_users_organization 
  FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE SET NULL;

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_module_access ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Super users can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_user'
    )
  );

CREATE POLICY "Admins can view users in their organization" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'admin' 
      AND organization_id = public.users.organization_id
    )
  );

CREATE POLICY "Super users can manage all users" ON public.users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_user'
    )
  );

-- RLS Policies for organizations table
CREATE POLICY "Admins can view their own organization" ON public.organizations
  FOR SELECT USING (admin_id = auth.uid());

CREATE POLICY "Super users can view all organizations" ON public.organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_user'
    )
  );

CREATE POLICY "Super users can manage all organizations" ON public.organizations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_user'
    )
  );

CREATE POLICY "Admins can manage their own organization" ON public.organizations
  FOR ALL USING (admin_id = auth.uid());

-- RLS Policies for modules table
CREATE POLICY "Everyone can view active modules" ON public.modules
  FOR SELECT USING (is_active = true);

CREATE POLICY "Super users can manage all modules" ON public.modules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_user'
    )
  );

-- RLS Policies for organization_modules table
CREATE POLICY "Organization members can view their modules" ON public.organization_modules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND organization_id = public.organization_modules.organization_id
    )
  );

CREATE POLICY "Admins can manage their organization modules" ON public.organization_modules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'admin' 
      AND organization_id = public.organization_modules.organization_id
    )
  );

CREATE POLICY "Super users can manage all organization modules" ON public.organization_modules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_user'
    )
  );

-- RLS Policies for employees table
CREATE POLICY "Users can view their own employee data" ON public.employees
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view employees in their organization" ON public.employees
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'admin' 
      AND organization_id = public.employees.organization_id
    )
  );

CREATE POLICY "Super users can view all employees" ON public.employees
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_user'
    )
  );

CREATE POLICY "Admins can manage employees in their organization" ON public.employees
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'admin' 
      AND organization_id = public.employees.organization_id
    )
  );

-- RLS Policies for user_module_access table
CREATE POLICY "Users can view their own module access" ON public.user_module_access
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage module access for their employees" ON public.user_module_access
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.employees e ON e.organization_id = u.organization_id
      WHERE u.id = auth.uid() 
      AND u.role = 'admin'
      AND e.user_id = public.user_module_access.user_id
    )
  );

-- Create functions for updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON public.modules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some default modules
INSERT INTO public.modules (name, description, price, features) VALUES
('Customer Management', 'Complete CRM solution for managing customer relationships', 29.99, ARRAY['Contact Management', 'Lead Tracking', 'Sales Pipeline']),
('Project Management', 'Tools for planning and tracking projects', 39.99, ARRAY['Task Management', 'Gantt Charts', 'Time Tracking']),
('Financial Management', 'Comprehensive financial tracking and reporting', 49.99, ARRAY['Invoicing', 'Expense Tracking', 'Financial Reports']),
('HR Management', 'Human resources management tools', 34.99, ARRAY['Employee Records', 'Payroll Management', 'Performance Reviews']),
('Inventory Management', 'Track and manage inventory levels', 24.99, ARRAY['Stock Tracking', 'Purchase Orders', 'Supplier Management']);

-- Create a function to handle new user registration with ADMIN as default role
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 