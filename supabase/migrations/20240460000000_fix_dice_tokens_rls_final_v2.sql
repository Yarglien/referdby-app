-- First, disable RLS temporarily to clean up
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

-- Create a policy that allows restaurant staff to insert tokens
CREATE POLICY "allow_restaurant_staff_insert"
ON dice_tokens FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('manager', 'server')
    )
);

-- Create a policy that allows reading tokens
CREATE POLICY "allow_restaurant_staff_select"
ON dice_tokens FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND (
            profiles.role IN ('manager', 'server')
            OR profiles.id = dice_tokens.created_by
        )
    )
);

-- Create a policy that allows updating tokens
CREATE POLICY "allow_restaurant_staff_update"
ON dice_tokens FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('manager', 'server')
    )
);