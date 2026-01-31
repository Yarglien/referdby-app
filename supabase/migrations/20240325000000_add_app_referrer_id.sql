-- First check if the column exists to avoid errors
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'activities' 
        AND column_name = 'app_referrer_id'
    ) THEN
        -- Add app_referrer_id column to activities table
        ALTER TABLE activities
        ADD COLUMN app_referrer_id UUID REFERENCES profiles(id);

        -- Add comment explaining the column
        COMMENT ON COLUMN activities.app_referrer_id IS 'ID of the person who invited the paying customer to join the app';
    END IF;
END $$;