-- Fix infinite recursion in profiles table RLS policies
-- Create security definer functions to avoid circular dependencies

-- Drop the problematic policies that cause recursion
DROP POLICY IF EXISTS "Restaurant staff can view customer profiles for their restaurant activities" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create security definer functions to check user roles without causing recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_restaurant_staff_for_user(target_user_id uuid)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM restaurants r
    JOIN profiles staff ON staff.id = auth.uid()
    JOIN activities a ON a.restaurant_id = r.id
    WHERE (
      -- Staff member must be manager of the restaurant or a server at the restaurant
      (staff.role = 'manager' AND r.manager_id = staff.id) OR 
      (staff.role = 'server' AND staff.restaurant_id = r.id)
    )
    AND a.user_id = target_user_id
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Recreate the policies using the security definer functions
-- 1. Restaurant staff can view profiles of users who have activities at their restaurant
CREATE POLICY "Restaurant staff can view customer profiles for their restaurant activities" 
ON public.profiles 
FOR SELECT 
USING (public.is_restaurant_staff_for_user(id));

-- 2. Allow admins to view all profiles (for admin management purposes)
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.get_current_user_role() = 'admin');