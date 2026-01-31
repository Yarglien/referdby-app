-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for restaurant staff" ON dice_tokens;
DROP POLICY IF EXISTS "Enable insert for restaurant staff" ON dice_tokens;
DROP POLICY IF EXISTS "Enable update for restaurant staff" ON dice_tokens;
DROP POLICY IF EXISTS "Enable scanning for all authenticated users" ON dice_tokens;

-- Enable RLS
ALTER TABLE dice_tokens ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read tokens
CREATE POLICY "Enable read for authenticated users" ON dice_tokens
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Allow restaurant staff to create tokens
CREATE POLICY "Enable insert for restaurant staff" ON dice_tokens
  FOR INSERT WITH CHECK (
    auth.uid() = created_by
  );

-- Allow updates by authenticated users
CREATE POLICY "Enable update for authenticated users" ON dice_tokens
  FOR UPDATE USING (
    auth.uid() IS NOT NULL
    AND is_active = true
  );