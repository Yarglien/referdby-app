-- Allow users to delete their own referrals
CREATE POLICY "Users can delete their own referrals"
ON public.referrals
FOR DELETE
USING (auth.uid() = creator_id);