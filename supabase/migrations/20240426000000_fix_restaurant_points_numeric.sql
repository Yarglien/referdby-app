-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.update_restaurant_points;

-- Create function to update restaurant points with proper numeric handling
CREATE OR REPLACE FUNCTION public.update_restaurant_points(
    p_points numeric,
    p_restaurant_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Update restaurant points with numeric type
    UPDATE restaurants
    SET 
        current_points = p_points,
        updated_at = NOW()
    WHERE id = p_restaurant_id;

    RETURN FOUND;
EXCEPTION
    WHEN others THEN
        RAISE EXCEPTION 'Failed to update restaurant points: %', SQLERRM;
END;
$$;

-- Grant execute permission to authenticated users
REVOKE ALL ON FUNCTION public.update_restaurant_points FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_restaurant_points TO authenticated;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';