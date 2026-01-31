-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.process_points_redemption;

-- Create new function with proper type handling
CREATE OR REPLACE FUNCTION public.process_points_redemption(
    p_current_points numeric,
    p_points_amount numeric,
    p_restaurant_id UUID,
    p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_points numeric;
    v_restaurant_points numeric;
BEGIN
    -- Input validation
    IF p_points_amount <= 0 THEN
        RAISE EXCEPTION 'Points amount must be greater than zero';
    END IF;

    -- Get current user points
    SELECT current_points INTO v_user_points
    FROM profiles
    WHERE id = p_user_id
    FOR UPDATE;

    IF v_user_points IS NULL OR v_user_points < p_points_amount THEN
        RAISE EXCEPTION 'Insufficient points balance';
    END IF;

    -- Get current restaurant points
    SELECT COALESCE(current_points, 0) INTO v_restaurant_points
    FROM restaurants
    WHERE id = p_restaurant_id
    FOR UPDATE;

    -- Update user points
    UPDATE profiles
    SET 
        current_points = current_points - p_points_amount,
        updated_at = NOW()
    WHERE id = p_user_id;

    -- Update restaurant points
    UPDATE restaurants
    SET 
        current_points = COALESCE(current_points, 0) + p_points_amount,
        updated_at = NOW()
    WHERE id = p_restaurant_id;

    RETURN TRUE;

EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.process_points_redemption TO authenticated;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';