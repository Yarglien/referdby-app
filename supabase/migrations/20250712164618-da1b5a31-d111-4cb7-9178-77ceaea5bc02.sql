-- Clean up conflicting dice_tokens RLS policies and fix token creation
-- First, drop all existing conflicting policies
DROP POLICY IF EXISTS "Enable creation for restaurant staff" ON dice_tokens;
DROP POLICY IF EXISTS "Restaurant staff can create tokens if enabled" ON dice_tokens;
DROP POLICY IF EXISTS "allow_staff_insert" ON dice_tokens;
DROP POLICY IF EXISTS "allow_staff_select" ON dice_tokens;
DROP POLICY IF EXISTS "allow_staff_update" ON dice_tokens;
DROP POLICY IF EXISTS "Enable read access for dice_tokens" ON dice_tokens;
DROP POLICY IF EXISTS "Enable updates for dice tokens" ON dice_tokens;
DROP POLICY IF EXISTS "Restaurant staff can process tokens" ON dice_tokens;
DROP POLICY IF EXISTS "Restaurant staff can view restaurant tokens" ON dice_tokens;
DROP POLICY IF EXISTS "Users can update their scanned tokens" ON dice_tokens;
DROP POLICY IF EXISTS "Users can view their own tokens" ON dice_tokens;

-- Create clean, non-conflicting policies
-- Allow restaurant managers and servers to create tokens for their restaurant (if roll meal offer is enabled)
CREATE POLICY "restaurant_staff_create_tokens" ON dice_tokens
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN restaurants r ON r.id = p.restaurant_id
      WHERE p.id = auth.uid()
      AND r.id = dice_tokens.restaurant_id
      AND p.role IN ('manager', 'server')
      AND r.has_roll_meal_offer = true
    )
  );

-- Allow restaurant staff to read tokens for their restaurant
CREATE POLICY "restaurant_staff_read_tokens" ON dice_tokens
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.restaurant_id = dice_tokens.restaurant_id
      AND p.role IN ('manager', 'server')
    )
  );

-- Allow users who created or scanned tokens to read them
CREATE POLICY "users_read_own_tokens" ON dice_tokens
  FOR SELECT USING (
    created_by = auth.uid() OR user_scanned_by = auth.uid()
  );

-- Allow restaurant staff to update tokens (for processing)
CREATE POLICY "restaurant_staff_update_tokens" ON dice_tokens
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.restaurant_id = dice_tokens.restaurant_id
      AND p.role IN ('manager', 'server')
    )
  );

-- Allow users to scan tokens (update scanned_by and state)
CREATE POLICY "users_scan_tokens" ON dice_tokens
  FOR UPDATE USING (
    is_active = true 
    AND expires_at > now()
    AND (user_scanned_by IS NULL OR user_scanned_by = auth.uid())
  );

-- Ensure RLS is enabled
ALTER TABLE dice_tokens ENABLE ROW LEVEL SECURITY;