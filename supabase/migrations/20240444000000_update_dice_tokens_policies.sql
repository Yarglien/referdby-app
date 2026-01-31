-- First, drop all existing policies
DROP POLICY IF EXISTS "Enable read access for restaurant staff" ON dice_tokens;
DROP POLICY IF EXISTS "Enable insert for restaurant staff" ON dice_tokens;
DROP POLICY IF EXISTS "Enable update for restaurant staff" ON dice_tokens;
DROP POLICY IF EXISTS "Enable scanning for all authenticated users" ON dice_tokens;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON dice_tokens;
DROP POLICY IF EXISTS "Enable delete for token owners" ON dice_tokens;
DROP POLICY IF EXISTS "Enable view own tokens" ON dice_tokens;

-- Enable RLS
ALTER TABLE dice_tokens ENABLE ROW LEVEL SECURITY;

-- Restaurant staff can view activities for their restaurant
CREATE POLICY "Enable read access for restaurant staff" ON dice_tokens
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.restaurant_id = dice_tokens.restaurant_id
    )
  );

-- Enable token insertion for restaurant staff
CREATE POLICY "Enable insert for restaurant staff" ON dice_tokens
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.restaurant_id = dice_tokens.restaurant_id
      AND profiles.role IN ('manager', 'server')
    )
  );

-- Users can view their own tokens
CREATE POLICY "Enable view own tokens" ON dice_tokens
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (created_by = auth.uid() OR user_scanned_by = auth.uid())
  );

-- Restaurant staff can update tokens for their restaurant
CREATE POLICY "Enable update for restaurant staff" ON dice_tokens
  FOR UPDATE USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.restaurant_id = dice_tokens.restaurant_id
      AND profiles.role IN ('manager', 'server')
    )
  );

-- Users can delete their own tokens
CREATE POLICY "Enable delete for token owners" ON dice_tokens
  FOR DELETE USING (
    auth.uid() IS NOT NULL
    AND created_by = auth.uid()
  );

-- Allow any authenticated user to scan tokens
CREATE POLICY "Enable scanning for all authenticated users" ON dice_tokens
  FOR UPDATE USING (
    auth.uid() IS NOT NULL
    AND is_active = true
    AND token_state = 'created'
  );