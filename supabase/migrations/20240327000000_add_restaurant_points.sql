DO $$ 
BEGIN
    -- Check if the current_points column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'restaurants' 
        AND column_name = 'current_points'
    ) THEN
        -- Add the current_points column if it doesn't exist
        ALTER TABLE restaurants 
        ADD COLUMN current_points TEXT DEFAULT '0';

        -- Add comment for documentation
        COMMENT ON COLUMN restaurants.current_points IS 'Current points balance for the restaurant';
    END IF;
END $$;

-- Refresh the schema cache to ensure PostgREST sees the new column
NOTIFY pgrst, 'reload schema';