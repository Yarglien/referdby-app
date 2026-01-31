-- Allow users to view profiles of people who created referrals they received
CREATE POLICY "Users can view referrer profiles"
ON public.profiles
FOR SELECT
USING (
  -- Allow viewing profiles of users who created referrals that the current user has scanned
  EXISTS (
    SELECT 1
    FROM referrals
    WHERE referrals.creator_id = profiles.id
    AND referrals.scanned_by_id = auth.uid()
  )
);