-- Idempotent policy creation for activities table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE tablename = 'activities' 
        AND policyname = 'Users can insert activities'
    ) THEN
        CREATE POLICY "Users can insert activities"
        ON public.activities
        FOR INSERT
        TO authenticated
        WITH CHECK (true);
    END IF;
END $$;