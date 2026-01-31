
-- First, drop existing policies
DROP POLICY IF EXISTS "Enable read access for restaurant staff" ON dice_tokens;
DROP POLICY IF EXISTS "Enable insert for restaurant staff" ON dice_tokens;
DROP POLICY IF EXISTS "Enable update for restaurant staff" ON dice_tokens;
DROP POLICY IF EXISTS "Enable scanning for all authenticated users" ON dice_tokens;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON dice_tokens;
DROP POLICY IF EXISTS "Enable delete for token owners" ON dice_tokens;
DROP POLICY IF EXISTS "Enable view own tokens" ON dice_tokens;

-- Enable RLS
ALTER TABLE dice_tokens ENABLE ROW LEVEL SECURITY;

-- Allow viewing tokens
CREATE POLICY "Enable read access for anyone" ON dice_tokens
  FOR SELECT USING (
    auth.uid() IS NOT NULL
  );

-- Restaurant staff can create tokens for their restaurant
CREATE POLICY "Enable insert for restaurant staff" ON dice_tokens
  FOR INSERT WITH CHECK (
    auth.uid() = created_by
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid()
      AND profiles.restaurant_id = dice_tokens.restaurant_id 
      AND profiles.role IN ('manager', 'server')
    )
  );

-- Allow scanning of active tokens by any authenticated user
CREATE POLICY "Enable scanning for all authenticated users" ON dice_tokens
  FOR UPDATE USING (
    auth.uid() IS NOT NULL
    AND is_active = true
  );
