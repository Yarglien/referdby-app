-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.update_restaurant_points;

-- Create function to update restaurant points with proper type handling
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
    -- Update restaurant points, converting to text for storage
    UPDATE restaurants
    SET current_points = p_points::text
    WHERE id = p_restaurant_id;

    -- Return true if a row was updated
    RETURN FOUND;
EXCEPTION
    WHEN others THEN
        RAISE EXCEPTION 'Failed to update restaurant points: %', SQLERRM;
END;
$$;

-- Grant execute permission to authenticated users
REVOKE ALL ON FUNCTION public.update_restaurant_points FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_restaurant_points TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.update_restaurant_points IS 'Updates restaurant points balance, handling numeric to text conversion';

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';