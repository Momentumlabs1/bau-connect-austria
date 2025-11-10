-- ============================================
-- BAUCONNECT24 - Fix handle_new_user function
-- ============================================

-- The handle_new_user function already has SET search_path = 'public'
-- but let's ensure it's properly formatted
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$;