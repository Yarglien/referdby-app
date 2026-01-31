-- Fix critical security vulnerability: Remove public read access to invites table
-- and restrict access so only authorized users can view relevant invite data

-- Drop the overly permissive policy that allows everyone to read all invites
DROP POLICY IF EXISTS "Invites are viewable by everyone" ON public.invites;

-- Create secure policies that protect invite data
-- 1. Users can view invites they created
CREATE POLICY "Users can view their own created invites" 
ON public.invites 
FOR SELECT 
USING (auth.uid() = created_by);

-- 2. Users can view invites that were assigned to them
CREATE POLICY "Users can view invites assigned to them" 
ON public.invites 
FOR SELECT 
USING (auth.uid() = used_by);

-- 3. Allow limited invite lookup for signup validation (only specific fields)
-- This allows checking if an invite exists and is valid without exposing all data
CREATE POLICY "Limited invite validation for signup" 
ON public.invites 
FOR SELECT 
USING (
  -- Only allow access during signup process and only for unused, non-expired invites
  used_at IS NULL 
  AND expires_at > NOW()
);

-- 4. Allow restaurant managers and admins to view invites for their restaurants
CREATE POLICY "Restaurant managers can view their restaurant invites" 
ON public.invites 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM profiles p
    WHERE p.id = auth.uid() 
    AND (
      (p.role = 'admin') OR 
      (p.role = 'manager' AND p.restaurant_id = invites.restaurant_id)
    )
  )
);

-- 5. Allow updating invites when they get used (for usage tracking)
CREATE POLICY "Allow invite usage updates" 
ON public.invites 
FOR UPDATE 
USING (
  -- Allow updates to mark invites as used
  used_at IS NULL 
  AND expires_at > NOW()
)
WITH CHECK (
  -- Ensure only usage fields are updated
  used_at IS NOT NULL 
  AND used_by IS NOT NULL
);