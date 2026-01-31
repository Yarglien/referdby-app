-- Update invites table to support the new approach
-- Add invite_type directly to the table for clarity
ALTER TABLE invites 
ADD COLUMN invite_type text;

-- Update existing records to have the invite_type based on type
UPDATE invites 
SET invite_type = type::text;

-- Make invite_type required for new records
ALTER TABLE invites 
ALTER COLUMN invite_type SET NOT NULL;

-- Add an index for faster lookups by ID
CREATE INDEX IF NOT EXISTS idx_invites_id ON invites(id);

-- Update the permanent code system to be optional
ALTER TABLE invites 
ALTER COLUMN invite_code DROP NOT NULL;

-- Create a function to create invite records for QR codes
CREATE OR REPLACE FUNCTION create_invite_for_qr(
  p_created_by uuid,
  p_invite_type text,
  p_restaurant_id uuid DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invite_id uuid;
BEGIN
  INSERT INTO invites (
    created_by,
    type,
    invite_type,
    restaurant_id,
    invite_code,
    expires_at
  ) VALUES (
    p_created_by,
    p_invite_type::invite_type,
    p_invite_type,
    p_restaurant_id,
    gen_random_uuid()::text, -- Still generate for backwards compatibility
    NOW() + INTERVAL '30 days'
  )
  RETURNING id INTO v_invite_id;
  
  RETURN v_invite_id;
END;
$$;