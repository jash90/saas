-- Update the default role in the users table to 'admin'
ALTER TABLE public.users ALTER COLUMN role SET DEFAULT 'admin';

-- Update the trigger function to set new users as 'admin' by default
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 