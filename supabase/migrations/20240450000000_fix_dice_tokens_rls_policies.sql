-- First, drop existing policies
DROP POLICY IF EXISTS "Enable read access for restaurant staff" ON dice_tokens;
DROP POLICY IF EXISTS "Enable insert for restaurant staff" ON dice_tokens;
DROP POLICY IF EXISTS "Enable update for restaurant staff" ON dice_tokens;
DROP POLICY IF EXISTS "Enable scanning for all authenticated users" ON dice_tokens;

-- Enable RLS
ALTER TABLE dice_tokens ENABLE ROW LEVEL SECURITY;

-- Allow reading tokens if user is associated with the restaurant or is the creator/scanner
CREATE POLICY "Enable read access for tokens" ON dice_tokens
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid()
      AND (
        profiles.restaurant_id = dice_tokens.restaurant_id
        OR dice_tokens.created_by = auth.uid()
        OR dice_tokens.scanned_by = auth.uid()
      )
    )
  );

-- Allow creating tokens for restaurant staff
CREATE POLICY "Enable token creation" ON dice_tokens
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid()
      AND profiles.restaurant_id = dice_tokens.restaurant_id 
      AND profiles.role IN ('manager', 'server')
    )
  );

-- Allow updating tokens for restaurant staff and scanners
CREATE POLICY "Enable token updates" ON dice_tokens
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid()
      AND (
        (profiles.restaurant_id = dice_tokens.restaurant_id AND profiles.role IN ('manager', 'server'))
        OR auth.uid() = dice_tokens.scanned_by
      )
    )
  );

-- Allow scanning active tokens
CREATE POLICY "Enable token scanning" ON dice_tokens
  FOR UPDATE USING (
    auth.uid() IS NOT NULL
    AND is_active = true
    AND scanned_by IS NULL
  );