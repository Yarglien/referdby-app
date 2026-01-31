-- Drop existing policies
DROP POLICY IF EXISTS "Enable read for authenticated users" ON dice_tokens;
DROP POLICY IF EXISTS "Enable insert for restaurant staff" ON dice_tokens;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON dice_tokens;

-- Enable RLS
ALTER TABLE dice_tokens ENABLE ROW LEVEL SECURITY;

-- Allow reading tokens if user is associated with the restaurant or created/scanned the token
CREATE POLICY "dice_tokens_read" ON dice_tokens
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid()
      AND (
        profiles.restaurant_id = dice_tokens.restaurant_id
        OR dice_tokens.created_by = auth.uid()
      )
    )
  );

-- Allow creating tokens for restaurant staff
CREATE POLICY "dice_tokens_insert" ON dice_tokens
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid()
      AND profiles.restaurant_id = dice_tokens.restaurant_id 
      AND profiles.role IN ('manager', 'server')
    )
  );

-- Allow updating tokens for restaurant staff
CREATE POLICY "dice_tokens_update" ON dice_tokens
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid()
      AND (
        (profiles.restaurant_id = dice_tokens.restaurant_id AND profiles.role IN ('manager', 'server'))
        OR auth.uid() = dice_tokens.created_by
      )
    )
  );