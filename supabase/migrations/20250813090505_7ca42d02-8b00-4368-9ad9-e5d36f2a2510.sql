-- Fix critical security vulnerability: Remove public read access to profiles table
-- and restrict access so users can only view their own profile data

-- Drop the overly permissive policy that allows everyone to read all profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create secure policies that protect user privacy
-- 1. Users can only view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- 2. Restaurant staff can view profiles of users who have activities at their restaurant
-- This is needed for the referral and bill processing functionality
CREATE POLICY "Restaurant staff can view customer profiles for their restaurant activities" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM restaurants r
    JOIN profiles staff ON staff.id = auth.uid()
    JOIN activities a ON a.restaurant_id = r.id
    WHERE (
      -- Staff member must be manager of the restaurant or a server at the restaurant
      (staff.role = 'manager' AND r.manager_id = staff.id) OR 
      (staff.role = 'server' AND staff.restaurant_id = r.id)
    )
    AND a.user_id = profiles.id  -- Can only view profiles of users with activities at their restaurant
  )
);

-- 3. Allow admins to view all profiles (for admin management purposes)
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM profiles admin_profile 
    WHERE admin_profile.id = auth.uid() 
    AND admin_profile.role = 'admin'
  )
);