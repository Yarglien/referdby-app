-- Add points_redeemed column to activities table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'activities' 
        AND column_name = 'points_redeemed'
    ) THEN
        ALTER TABLE activities
        ADD COLUMN points_redeemed INTEGER DEFAULT 0;

        -- Add comment for documentation
        COMMENT ON COLUMN activities.points_redeemed IS 'Number of points redeemed in this activity';
    END IF;
END $$;