-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS public.update_user_points;

-- Create a function to update user points atomically
CREATE OR REPLACE FUNCTION public.update_user_points(
    p_points numeric,
    p_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE profiles 
    SET 
        current_points = p_points,
        updated_at = NOW()
    WHERE id = p_user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.update_user_points(numeric, uuid) TO authenticated;