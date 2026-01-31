-- Convert points columns from text to numeric and set default values
ALTER TABLE profiles 
  ALTER COLUMN current_points SET DEFAULT 0,
  ALTER COLUMN current_points SET NOT NULL;

ALTER TABLE restaurants
  ALTER COLUMN current_points SET DEFAULT 0,
  ALTER COLUMN current_points SET NOT NULL;

-- Update any NULL values to 0
UPDATE profiles SET current_points = 0 WHERE current_points IS NULL;
UPDATE restaurants SET current_points = 0 WHERE current_points IS NULL;

-- Update the points redemption function to handle numeric types properly
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
    SET current_points = current_points - p_points_amount
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