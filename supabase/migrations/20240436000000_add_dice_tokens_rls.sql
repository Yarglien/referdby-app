-- First, enable RLS on the dice_tokens table if not already enabled
ALTER TABLE dice_tokens ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Enable read access for restaurant staff" ON dice_tokens;
DROP POLICY IF EXISTS "Enable insert for restaurant staff" ON dice_tokens;
DROP POLICY IF EXISTS "Enable update for restaurant staff" ON dice_tokens;

-- Allow restaurant staff to read tokens for their restaurant
CREATE POLICY "Enable read access for restaurant staff" ON dice_tokens
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.restaurant_id = dice_tokens.restaurant_id
        OR profiles.id = dice_tokens.token_creator
      )
    )
  );

-- Allow restaurant staff to create tokens for their restaurant
CREATE POLICY "Enable insert for restaurant staff" ON dice_tokens
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.restaurant_id = dice_tokens.restaurant_id
      AND profiles.role IN ('manager', 'server')
    )
  );

-- Allow restaurant staff to update tokens for their restaurant
CREATE POLICY "Enable update for restaurant staff" ON dice_tokens
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.restaurant_id = dice_tokens.restaurant_id
      AND profiles.role IN ('manager', 'server')
    )
  );