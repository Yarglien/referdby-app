-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.process_points_redemption;

-- Create new function with proper type handling
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
BEGIN
    -- Update user points
    UPDATE profiles
    SET current_points = p_current_points - p_points_amount
    WHERE id = p_user_id
    AND current_points >= p_points_amount;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient points balance or user not found';
    END IF;

    -- Update restaurant points
    UPDATE restaurants
    SET current_points = COALESCE(
        NULLIF(current_points, '')::INTEGER,
        0
    ) + p_points_amount
    WHERE id = p_restaurant_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Restaurant not found';
    END IF;

    RETURN TRUE;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.process_points_redemption TO authenticated;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';