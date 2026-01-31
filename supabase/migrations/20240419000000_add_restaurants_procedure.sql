-- Create the function to get restaurants with their schedules
CREATE OR REPLACE FUNCTION public.get_restaurants_with_schedules()
RETURNS TABLE (
    id uuid,
    name text,
    address text,
    cuisine_type text,
    latitude numeric,
    longitude numeric,
    opening_hours json,
    redemption_schedule json
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.name,
        r.address,
        r.cuisine_type,
        r.latitude,
        r.longitude,
        json_agg(DISTINCT oh.*) as opening_hours,
        json_agg(DISTINCT rs.*) as redemption_schedule
    FROM restaurants r
    LEFT JOIN opening_hours oh ON r.id = oh.restaurant_id
    LEFT JOIN redemption_schedule rs ON r.id = rs.restaurant_id
    GROUP BY r.id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_restaurants_with_schedules() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_restaurants_with_schedules() TO service_role;

-- Add RLS policies for the relevant tables
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opening_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redemption_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users"
ON public.restaurants FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable read access for authenticated users"
ON public.opening_hours FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable read access for authenticated users"
ON public.redemption_schedule FOR SELECT
TO authenticated
USING (true);