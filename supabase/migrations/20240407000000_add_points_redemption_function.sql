-- Drop the function if it exists to avoid conflicts
DROP FUNCTION IF EXISTS public.process_points_redemption;

-- Create or replace the function to process points redemption
CREATE OR REPLACE FUNCTION public.process_points_redemption(
  p_current_points NUMERIC,
  p_points_amount NUMERIC,
  p_restaurant_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_points NUMERIC;
  v_restaurant_points NUMERIC;
BEGIN
  -- Step 1: Validate input parameters
  IF p_points_amount <= 0 THEN
    RAISE EXCEPTION 'Points amount must be greater than zero';
  END IF;

  IF p_points_amount > p_current_points THEN
    RAISE EXCEPTION 'Cannot redeem more points than available';
  END IF;

  -- Step 2: Get and validate current user points
  SELECT COALESCE(NULLIF(current_points, '')::NUMERIC, 0)
  INTO v_current_points
  FROM profiles
  WHERE id = p_user_id;

  IF v_current_points IS NULL OR v_current_points != p_current_points THEN
    RAISE EXCEPTION 'Current points do not match expected value';
  END IF;

  -- Step 3: Get current restaurant points
  SELECT COALESCE(NULLIF(current_points, '')::NUMERIC, 0)
  INTO v_restaurant_points
  FROM restaurants
  WHERE id = p_restaurant_id;

  -- Step 4: Update user points
  UPDATE profiles
  SET current_points = (v_current_points - p_points_amount)::TEXT
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Step 5: Update restaurant points
  UPDATE restaurants
  SET current_points = (COALESCE(v_restaurant_points, 0) + p_points_amount)::TEXT
  WHERE id = p_restaurant_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Restaurant not found';
  END IF;

  -- Step 6: Return success
  RETURN TRUE;

EXCEPTION
  WHEN OTHERS THEN
    -- Log the error details
    RAISE NOTICE 'Error in process_points_redemption: %', SQLERRM;
    RAISE;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.process_points_redemption TO authenticated;

-- Refresh the schema cache to ensure PostgREST sees the new function
NOTIFY pgrst, 'reload schema';