-- First, drop existing policies
DROP POLICY IF EXISTS "Enable read access for tokens" ON dice_tokens;
DROP POLICY IF EXISTS "Enable token creation" ON dice_tokens;
DROP POLICY IF EXISTS "Enable token updates" ON dice_tokens;
DROP POLICY IF EXISTS "Enable token scanning" ON dice_tokens;

-- Enable RLS
ALTER TABLE dice_tokens ENABLE ROW LEVEL SECURITY;

-- Part 1: Token Creation and Management (Restaurant Staff)
-- Allow restaurant staff to read their tokens
CREATE POLICY "restaurant_staff_read_tokens" ON dice_tokens
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.restaurant_id = dice_tokens.restaurant_id
      AND profiles.role IN ('manager', 'server')
    )
  );

-- Allow restaurant staff to create tokens
CREATE POLICY "restaurant_staff_create_tokens" ON dice_tokens
  FOR INSERT WITH CHECK (
    auth.uid() = created_by
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.restaurant_id = dice_tokens.restaurant_id
      AND profiles.role IN ('manager', 'server')
    )
  );

-- Allow restaurant staff to manage their tokens
CREATE POLICY "restaurant_staff_manage_tokens" ON dice_tokens
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.restaurant_id = dice_tokens.restaurant_id
      AND profiles.role IN ('manager', 'server')
    )
  );

-- Part 2: Token Usage (Customers)
-- Allow customers to read active tokens they've scanned
CREATE POLICY "customer_read_scanned_tokens" ON dice_tokens
  FOR SELECT USING (
    auth.uid() = scanned_by
    AND is_active = true
  );

-- Allow customers to scan (update) active tokens
CREATE POLICY "customer_scan_tokens" ON dice_tokens
  FOR UPDATE USING (
    is_active = true 
    AND scanned_by IS NULL
  ) WITH CHECK (
    auth.uid() IS NOT NULL
    AND is_active = true
    AND scanned_by IS NULL
  );