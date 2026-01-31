-- Drop existing policies
DROP POLICY IF EXISTS "dice_tokens_read" ON dice_tokens;
DROP POLICY IF EXISTS "dice_tokens_insert" ON dice_tokens;
DROP POLICY IF EXISTS "dice_tokens_update" ON dice_tokens;

-- Enable RLS
ALTER TABLE dice_tokens ENABLE ROW LEVEL SECURITY;

-- Simple read policy for authenticated users
CREATE POLICY "dice_tokens_read_simple"
ON dice_tokens FOR SELECT
TO authenticated
USING (true);

-- Simple insert policy for authenticated users
CREATE POLICY "dice_tokens_insert_simple"
ON dice_tokens FOR INSERT
TO authenticated
WITH CHECK (true);

-- Simple update policy for authenticated users
CREATE POLICY "dice_tokens_update_simple"
ON dice_tokens FOR UPDATE
TO authenticated
USING (true);