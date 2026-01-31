-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS claim_referral(p_referral_id uuid, p_user_id uuid);

-- Create the updated function
CREATE OR REPLACE FUNCTION claim_referral(
  p_referral_id uuid,
  p_user_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_referral record;
  v_result json;
BEGIN
  -- Get the referral record
  SELECT * INTO v_referral
  FROM referrals
  WHERE id = p_referral_id;

  -- Validate referral exists
  IF v_referral IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Referral not found'
    );
  END IF;

  -- Check if referral is already used
  IF v_referral.status != 'active' THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Referral is not active'
    );
  END IF;

  -- Check if user is trying to claim their own referral
  IF v_referral.creator_id = p_user_id THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Cannot claim your own referral'
    );
  END IF;

  -- Update referral status to used
  UPDATE referrals
  SET 
    status = 'used',
    used_at = NOW(),
    used_by = p_user_id
  WHERE id = p_referral_id;

  RETURN json_build_object(
    'success', true,
    'message', 'Referral claimed successfully'
  );
END;
$$;