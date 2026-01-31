-- Revert invite table security policies to allow public read access
-- Invite codes are designed to be publicly shareable, not security-sensitive

-- Drop the restrictive policies that were incorrectly applied
DROP POLICY IF EXISTS "Users can view their own created invites" ON public.invites;
DROP POLICY IF EXISTS "Users can view invites assigned to them" ON public.invites;
DROP POLICY IF EXISTS "Limited invite validation for signup" ON public.invites;
DROP POLICY IF EXISTS "Restaurant managers can view their restaurant invites" ON public.invites;
DROP POLICY IF EXISTS "Allow invite usage updates" ON public.invites;

-- Restore the original public read access policy
-- This is intentional - invite codes are meant to be shareable
CREATE POLICY "Invites are viewable by everyone" 
ON public.invites 
FOR SELECT 
USING (true);

-- Keep the existing insert and update policies for proper access control
-- Users can still create invites as before
-- Updates for marking invites as used should still work