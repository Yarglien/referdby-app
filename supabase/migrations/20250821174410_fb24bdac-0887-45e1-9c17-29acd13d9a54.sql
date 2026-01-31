-- Drop existing conflicting policies for referrals table
DROP POLICY IF EXISTS "Users can view their referrals" ON public.referrals;
DROP POLICY IF EXISTS "Enable referral viewing for all users" ON public.referrals;

-- Create a single comprehensive policy for referral viewing
CREATE POLICY "Allow referral viewing for claiming and management" 
ON public.referrals 
FOR SELECT 
USING (
  -- Allow everyone to view referrals (needed for claiming via shared links)
  true
);