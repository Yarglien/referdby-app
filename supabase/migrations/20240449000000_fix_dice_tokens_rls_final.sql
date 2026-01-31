-- First, drop existing policies
DROP POLICY IF EXISTS "Enable read access for restaurant staff" ON dice_tokens;
DROP POLICY IF EXISTS "Enable insert for restaurant staff" ON dice_tokens;
DROP POLICY IF EXISTS "Enable update for restaurant staff" ON dice_tokens;
DROP POLICY IF EXISTS "Enable scanning for all authenticated users" ON dice_tokens;

-- Enable RLS
ALTER TABLE dice_tokens ENABLE ROW LEVEL SECURITY;

-- Allow restaurant staff to read tokens for their restaurant
CREATE POLICY "Enable read access for restaurant staff" ON dice_tokens
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid()
      AND (
        profiles.restaurant_id = dice_tokens.restaurant_id
        OR created_by = auth.uid()
        OR scanned_by = auth.uid()
      )
    )
  );

-- Allow restaurant staff to create tokens
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

-- Allow restaurant staff to update tokens
CREATE POLICY "Enable update for restaurant staff" ON dice_tokens
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid()
      AND (
        (profiles.restaurant_id = dice_tokens.restaurant_id AND profiles.role IN ('manager', 'server'))
        OR auth.uid() = scanned_by
      )
    )
  );

-- Allow scanning of active tokens
CREATE POLICY "Enable scanning for all authenticated users" ON dice_tokens
  FOR UPDATE USING (
    auth.uid() IS NOT NULL
    AND is_active = true
    AND scanned_by IS NULL
  ) WITH CHECK (
    auth.uid() IS NOT NULL
    AND is_active = true
    AND scanned_by IS NULL
  );