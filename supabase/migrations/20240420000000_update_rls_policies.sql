-- Enable RLS on the tables
ALTER TABLE public.opening_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redemption_schedule ENABLE ROW LEVEL SECURITY;

-- Create policies for opening_hours
CREATE POLICY "Enable read access for all users"
ON public.opening_hours FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable write access for restaurant managers"
ON public.opening_hours FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM restaurants
        WHERE restaurants.id = opening_hours.restaurant_id
        AND restaurants.manager_id = auth.uid()
    )
);

-- Create policies for redemption_schedule
CREATE POLICY "Enable read access for all users"
ON public.redemption_schedule FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable write access for restaurant managers"
ON public.redemption_schedule FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM restaurants
        WHERE restaurants.id = redemption_schedule.restaurant_id
        AND restaurants.manager_id = auth.uid()
    )
);