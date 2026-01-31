-- Drop the old version of the function to resolve overloading conflict
DROP FUNCTION IF EXISTS create_invite_for_qr(uuid, text, uuid);

-- Ensure only the 4-parameter version exists
-- (The new version with p_is_permanent parameter should remain)