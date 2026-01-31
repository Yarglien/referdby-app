-- Update the restaurants SELECT policy to work for both public and authenticated users
DROP POLICY IF EXISTS "Restaurants are viewable by everyone" ON public.restaurants;

CREATE POLICY "Restaurants are viewable by everyone" 
ON public.restaurants 
FOR SELECT 
TO public, authenticated
USING (true);