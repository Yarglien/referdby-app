-- First, drop existing insert policy if it exists
DROP POLICY IF EXISTS "Enable insert for restaurant staff" ON dice_tokens;

-- Create new insert policy that properly checks user role and restaurant association
CREATE POLICY "Enable insert for restaurant staff" ON dice_tokens
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.restaurant_id = dice_tokens.restaurant_id
      AND profiles.role IN ('manager', 'server')
    )
  );

-- Ensure RLS is enabled
ALTER TABLE dice_tokens ENABLE ROW LEVEL SECURITY;