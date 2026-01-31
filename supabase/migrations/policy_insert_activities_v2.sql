-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable insert activities for authenticated users" ON activities;

-- Create new policy for inserting activities
CREATE POLICY "Enable insert activities for authenticated users" 
ON activities FOR INSERT 
TO authenticated 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND user_id = auth.uid()
);

-- Ensure RLS is enabled
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;