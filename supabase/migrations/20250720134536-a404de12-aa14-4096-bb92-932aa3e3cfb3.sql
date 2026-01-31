-- Create a function to get manager's restaurant safely
CREATE OR REPLACE FUNCTION get_manager_restaurant(manager_user_id UUID)
RETURNS SETOF restaurants
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM restaurants WHERE manager_id = manager_user_id;
$$;