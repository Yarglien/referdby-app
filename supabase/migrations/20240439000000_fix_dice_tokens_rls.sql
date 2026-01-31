-- First, drop all existing policies for dice_tokens
DROP POLICY IF EXISTS "Enable read access for restaurant staff" ON dice_tokens;
DROP POLICY IF EXISTS "Enable insert for restaurant staff" ON dice_tokens;
DROP POLICY IF EXISTS "Enable update for restaurant staff" ON dice_tokens;

-- Enable RLS
ALTER TABLE dice_tokens ENABLE ROW LEVEL SECURITY;

-- Allow restaurant staff to read tokens for their restaurant
CREATE POLICY "Enable read access for restaurant staff" ON dice_tokens
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.restaurant_id = dice_tokens.restaurant_id
    )
  );

-- Allow restaurant staff to create tokens for their restaurant
CREATE POLICY "Enable insert for restaurant staff" ON dice_tokens
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.restaurant_id = dice_tokens.restaurant_id
      AND (profiles.role = 'manager' OR profiles.role = 'server')
    )
  );

-- Allow restaurant staff to update tokens for their restaurant
CREATE POLICY "Enable update for restaurant staff" ON dice_tokens
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.restaurant_id = dice_tokens.restaurant_id
      AND (profiles.role = 'manager' OR profiles.role = 'server')
    )
  );

-- Allow users to scan tokens (update scanned_by and scanned_at)
CREATE POLICY "Enable scanning for all authenticated users" ON dice_tokens
  FOR UPDATE USING (
    auth.uid() IS NOT NULL
  ) WITH CHECK (
    auth.uid() IS NOT NULL
  );