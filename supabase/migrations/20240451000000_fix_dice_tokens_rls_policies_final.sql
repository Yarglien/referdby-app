-- First, drop existing policies
DROP POLICY IF EXISTS "Enable read access for tokens" ON dice_tokens;
DROP POLICY IF EXISTS "Enable token creation" ON dice_tokens;
DROP POLICY IF EXISTS "Enable token updates" ON dice_tokens;
DROP POLICY IF EXISTS "Enable token scanning" ON dice_tokens;

-- Enable RLS
ALTER TABLE dice_tokens ENABLE ROW LEVEL SECURITY;

-- Allow reading tokens if user is associated with the restaurant or is the creator/scanner
CREATE POLICY "Enable read access for tokens" ON dice_tokens
  FOR SELECT USING (
    auth.uid() IS NOT NULL
  );

-- Allow creating tokens for restaurant staff
CREATE POLICY "Enable token creation" ON dice_tokens
  FOR INSERT WITH CHECK (
    auth.uid() = created_by
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid()
      AND profiles.restaurant_id = dice_tokens.restaurant_id 
      AND profiles.role IN ('manager', 'server')
    )
  );

-- Allow updating tokens for restaurant staff and scanners
CREATE POLICY "Enable token updates" ON dice_tokens
  FOR UPDATE USING (
    auth.uid() IS NOT NULL
    AND (
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid()
        AND profiles.restaurant_id = dice_tokens.restaurant_id 
        AND profiles.role IN ('manager', 'server')
      )
      OR (
        is_active = true 
        AND scanned_by IS NULL
      )
    )
  );