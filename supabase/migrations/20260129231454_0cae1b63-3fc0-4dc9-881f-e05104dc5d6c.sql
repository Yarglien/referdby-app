-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Managers can view server profiles at their restaurant" ON public.profiles;

-- Create a security definer function to check if user is manager of a restaurant
CREATE OR REPLACE FUNCTION public.is_manager_of_restaurant(target_restaurant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM restaurants r
    WHERE r.id = target_restaurant_id
      AND r.manager_id = auth.uid()
  )
$$;

-- Create a security definer function to check if current user is a manager viewing their servers
CREATE OR REPLACE FUNCTION public.can_view_server_profile(target_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM profiles p
    JOIN restaurants r ON r.id = p.restaurant_id
    WHERE p.id = target_profile_id
      AND p.role = 'server'
      AND r.manager_id = auth.uid()
  )
$$;

-- Create the fixed RLS policy using the security definer function
CREATE POLICY "Managers can view server profiles at their restaurant"
ON public.profiles FOR SELECT
TO authenticated
USING (public.can_view_server_profile(id));