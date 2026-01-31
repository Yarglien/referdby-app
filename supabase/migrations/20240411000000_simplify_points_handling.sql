-- Drop existing function
DROP FUNCTION IF EXISTS public.process_points_redemption;

-- Create new function with simplified points handling
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
BEGIN
    -- Get user points directly as integer
    SELECT CASE 
        WHEN current_points ~ E'^\\d+$' THEN current_points::INTEGER 
        ELSE 0 
    END INTO v_user_points
    FROM profiles
    WHERE id = p_user_id;

    -- Validate points
    IF v_user_points < p_points_amount THEN
        RAISE EXCEPTION 'Insufficient points balance: have %, need %', v_user_points, p_points_amount;
    END IF;

    -- Update user points
    UPDATE profiles
    SET current_points = (v_user_points - p_points_amount)::TEXT
    WHERE id = p_user_id;

    -- Update restaurant points
    UPDATE restaurants
    SET current_points = (
        CASE 
            WHEN current_points ~ E'^\\d+$' THEN current_points::INTEGER 
            ELSE 0 
        END + p_points_amount
    )::TEXT
    WHERE id = p_restaurant_id;

    RETURN TRUE;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.process_points_redemption TO authenticated;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';