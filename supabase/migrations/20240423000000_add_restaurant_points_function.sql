-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.update_restaurant_points;

-- Create function to update restaurant points with proper numeric handling
CREATE OR REPLACE FUNCTION public.update_restaurant_points(
    p_points numeric,
    p_restaurant_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Update restaurant points using numeric type
    UPDATE restaurants
    SET 
        current_points = p_points,
        updated_at = NOW()
    WHERE id = p_restaurant_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Restaurant not found';
    END IF;
END;
$$;

-- Grant execute permission to authenticated users
REVOKE ALL ON FUNCTION public.update_restaurant_points FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_restaurant_points TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.update_restaurant_points IS 'Updates restaurant points balance using numeric type';

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';