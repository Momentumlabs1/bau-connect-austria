-- ============================================================
-- PHASE 1: CREATE USER ROLES ARCHITECTURE
-- ============================================================

-- 1. Create app_role enum
CREATE TYPE app_role AS ENUM ('admin', 'customer', 'contractor');

-- 2. Create user_roles table
CREATE TABLE user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role)
);

-- 3. Enable RLS on user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Migrate existing roles from profiles to user_roles
INSERT INTO user_roles (user_id, role)
SELECT id, role::app_role 
FROM profiles 
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- 5. Create security definer function to check roles
CREATE OR REPLACE FUNCTION has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- 6. RLS policies for user_roles
CREATE POLICY "Users can view own roles" ON user_roles
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON user_roles
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'));

-- ============================================================
-- PHASE 2: DATA PRIVACY FIXES
-- ============================================================

-- 7. Block anonymous access to profiles table
CREATE POLICY "Block anonymous access to profiles" ON profiles
  FOR SELECT 
  TO anon 
  USING (false);

-- 8. Drop role column from profiles (data already migrated)
ALTER TABLE profiles DROP COLUMN IF EXISTS role;

-- ============================================================
-- COMPLETED: USER ROLES SECURITY ARCHITECTURE
-- ============================================================
-- ✅ app_role enum created with admin/customer/contractor
-- ✅ user_roles table with RLS enabled
-- ✅ Existing roles migrated from profiles
-- ✅ has_role() security definer function created
-- ✅ RLS policies for user_roles (users view own, admins manage all)
-- ✅ Anonymous access to profiles blocked
-- ✅ role column removed from profiles