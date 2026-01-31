-- Enable Row Level Security
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.activities;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.activities;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.activities;

-- Create policy for inserting activities
CREATE POLICY "Enable insert for authenticated users"
ON public.activities
FOR INSERT 
TO authenticated
WITH CHECK (
    auth.uid() IN (user_id, processed_by_id)
);

-- Create policy for selecting activities
CREATE POLICY "Enable read access for authenticated users"
ON public.activities
FOR SELECT 
TO authenticated
USING (
    auth.uid() IN (user_id, related_user_id, processed_by_id, scanner_id)
);

-- Create policy for updating activities
CREATE POLICY "Enable update for authenticated users"
ON public.activities
FOR UPDATE 
TO authenticated
USING (
    auth.uid() IN (user_id, processed_by_id)
)
WITH CHECK (
    auth.uid() IN (user_id, processed_by_id)
);