-- Add RLS policy to allow managers to view profiles of servers at their restaurant
CREATE POLICY "Managers can view server profiles at their restaurant"
ON public.profiles FOR SELECT
TO authenticated
USING (
  -- Allow if the viewer is a manager and the target profile is a server at the manager's restaurant
  EXISTS (
    SELECT 1 
    FROM restaurants r
    JOIN profiles manager_profile ON manager_profile.id = auth.uid()
    WHERE 
      r.manager_id = auth.uid() 
      AND manager_profile.role = 'manager'
      AND profiles.restaurant_id = r.id
      AND profiles.role = 'server'
  )
);