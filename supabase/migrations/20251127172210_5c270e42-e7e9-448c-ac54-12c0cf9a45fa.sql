-- Fix handle_new_user trigger to properly insert into user_roles table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
DECLARE
  _role text;
BEGIN
  -- Insert into profiles WITHOUT role column (only id and email)
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  
  -- Get role from metadata, default to 'customer'
  _role := COALESCE(NEW.raw_user_meta_data->>'role', 'customer');
  
  -- Insert role into user_roles table with proper enum cast
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role::app_role);
  
  RETURN NEW;
END;
$$;