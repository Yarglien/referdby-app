-- Update the create_invite_for_qr function to create permanent invites
CREATE OR REPLACE FUNCTION create_invite_for_qr(
  p_created_by uuid,
  p_invite_type text,
  p_restaurant_id uuid DEFAULT NULL,
  p_is_permanent boolean DEFAULT true
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invite_id uuid;
  v_expires_at timestamp with time zone;
BEGIN
  -- Set expiration based on whether it's permanent
  IF p_is_permanent THEN
    v_expires_at := NOW() + INTERVAL '10 years'; -- Effectively permanent
  ELSE
    v_expires_at := NOW() + INTERVAL '30 days'; -- Standard expiration
  END IF;

  INSERT INTO invites (
    created_by,
    type,
    invite_type,
    restaurant_id,
    invite_code,
    permanent_code,
    expires_at
  ) VALUES (
    p_created_by,
    p_invite_type::invite_type,
    p_invite_type,
    p_restaurant_id,
    CASE WHEN p_is_permanent THEN NULL ELSE gen_random_uuid()::text END,
    CASE WHEN p_is_permanent THEN gen_random_uuid()::text ELSE NULL END,
    v_expires_at
  )
  RETURNING id INTO v_invite_id;
  
  RETURN v_invite_id;
END;
$$;

-- Update the cleanup function to preserve permanent invites
CREATE OR REPLACE FUNCTION clean_expired_invites()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only delete non-permanent invites that are expired and unused
    DELETE FROM invites 
    WHERE used_at IS NULL 
    AND expires_at < NOW()
    AND permanent_code IS NULL; -- Preserve permanent invites
END;
$$;