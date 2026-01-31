-- Drop existing function
DROP FUNCTION IF EXISTS public.process_points_redemption;

-- Create new function with proper type casting
CREATE OR REPLACE FUNCTION public.process_points_redemption(
    p_current_points INTEGER,
    p_points_amount INTEGER,
    p_restaurant_id UUID,
    p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_points INTEGER;
    v_restaurant_points INTEGER;
BEGIN
    -- Get and validate user points with proper type casting
    SELECT COALESCE(NULLIF(current_points, '')::INTEGER, 0)
    INTO v_user_points
    FROM profiles
    WHERE id = p_user_id;

    IF v_user_points IS NULL THEN
        RAISE EXCEPTION 'User points not found';
    END IF;

    IF v_user_points != p_current_points THEN
        RAISE EXCEPTION 'Current points (%) do not match expected value (%)', v_user_points, p_current_points;
    END IF;

    IF v_user_points < p_points_amount THEN
        RAISE EXCEPTION 'Insufficient points balance: have %, need %', v_user_points, p_points_amount;
    END IF;

    -- Get restaurant points with proper type casting
    SELECT COALESCE(NULLIF(current_points, '')::INTEGER, 0)
    INTO v_restaurant_points
    FROM restaurants
    WHERE id = p_restaurant_id;

    -- Update user points with proper type casting back to text
    UPDATE profiles
    SET current_points = (v_user_points - p_points_amount)::TEXT
    WHERE id = p_user_id;

    -- Update restaurant points with proper type casting back to text
    UPDATE restaurants
    SET current_points = (COALESCE(v_restaurant_points, 0) + p_points_amount)::TEXT
    WHERE id = p_restaurant_id;

    RETURN TRUE;

EXCEPTION
    WHEN OTHERS THEN
        -- Log error details
        RAISE NOTICE 'Error in process_points_redemption: %', SQLERRM;
        RAISE;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.process_points_redemption TO authenticated;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';