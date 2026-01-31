-- Drop existing function
DROP FUNCTION IF EXISTS public.process_points_redemption;

-- Create new function with proper numeric handling
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
    -- Get user points directly as integer
    SELECT COALESCE(current_points, 0)::INTEGER
    INTO v_user_points
    FROM profiles
    WHERE id = p_user_id;

    IF v_user_points < p_points_amount THEN
        RAISE EXCEPTION 'Insufficient points balance: have %, need %', v_user_points, p_points_amount;
    END IF;

    -- Get restaurant points
    SELECT COALESCE(current_points, 0)::INTEGER
    INTO v_restaurant_points
    FROM restaurants
    WHERE id = p_restaurant_id;

    -- Update user points (store as integer)
    UPDATE profiles
    SET current_points = v_user_points - p_points_amount
    WHERE id = p_user_id;

    -- Update restaurant points (store as integer)
    UPDATE restaurants
    SET current_points = v_restaurant_points + p_points_amount
    WHERE id = p_restaurant_id;

    RETURN TRUE;

EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END;
$$;