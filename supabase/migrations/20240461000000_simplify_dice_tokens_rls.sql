-- Disable RLS temporarily
ALTER TABLE dice_tokens DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "dice_tokens_read" ON dice_tokens;
DROP POLICY IF EXISTS "dice_tokens_read_simple" ON dice_tokens;
DROP POLICY IF EXISTS "dice_tokens_insert" ON dice_tokens;
DROP POLICY IF EXISTS "dice_tokens_insert_simple" ON dice_tokens;
DROP POLICY IF EXISTS "dice_tokens_update" ON dice_tokens;
DROP POLICY IF EXISTS "dice_tokens_update_simple" ON dice_tokens;
DROP POLICY IF EXISTS "Enable read access for restaurant staff" ON dice_tokens;
DROP POLICY IF EXISTS "Enable insert for restaurant staff" ON dice_tokens;
DROP POLICY IF EXISTS "Enable update for restaurant staff" ON dice_tokens;

-- Re-enable RLS
ALTER TABLE dice_tokens ENABLE ROW LEVEL SECURITY;

-- Simple insert policy for staff
CREATE POLICY "allow_staff_insert"
ON dice_tokens FOR INSERT
TO authenticated
WITH CHECK (true);

-- Simple select policy for staff
CREATE POLICY "allow_staff_select"
ON dice_tokens FOR SELECT
TO authenticated
USING (true);

-- Simple update policy for staff
CREATE POLICY "allow_staff_update"
ON dice_tokens FOR UPDATE
TO authenticated
USING (true);