-- Drop existing function
DROP FUNCTION IF EXISTS public.process_points_redemption;

-- Create new function with numeric type
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
BEGIN
    IF p_points_amount <= 0 THEN
        RAISE EXCEPTION 'Points amount must be greater than zero';
    END IF;

    -- Update user points
    UPDATE profiles
    SET current_points = ROUND(current_points - p_points_amount, 2)
    WHERE id = p_user_id
    AND current_points >= p_points_amount;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient points balance or user not found';
    END IF;

    -- Update restaurant points
    UPDATE restaurants
    SET current_points = ROUND(COALESCE(current_points, 0) + p_points_amount, 2)
    WHERE id = p_restaurant_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Restaurant not found';
    END IF;

    RETURN TRUE;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.process_points_redemption TO authenticated;