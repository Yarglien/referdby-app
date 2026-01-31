-- Convert points columns from text to numeric
ALTER TABLE profiles 
  ALTER COLUMN current_points TYPE numeric USING current_points::numeric;

ALTER TABLE restaurants
  ALTER COLUMN current_points TYPE numeric USING current_points::numeric;

-- Update the points redemption function to use numeric types
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
    SET current_points = COALESCE(current_points, 0) + p_points_amount
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