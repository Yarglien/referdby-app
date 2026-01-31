-- First, check if columns exist and drop foreign key if it does
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.constraint_column_usage 
        WHERE constraint_name = 'fk_app_referrer'
    ) THEN
        ALTER TABLE activities DROP CONSTRAINT IF EXISTS fk_app_referrer;
    END IF;
END $$;

-- Add points-related columns to activities table
ALTER TABLE activities
ADD COLUMN IF NOT EXISTS customer_points integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS referrer_points integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS restaurant_recruiter_points integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS app_referrer_points integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS restaurant_deduction integer DEFAULT 0;

-- Ensure app_referrer_id is the correct type (uuid)
DO $$ 
BEGIN
    -- Drop the column if it exists with wrong type
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'activities' 
        AND column_name = 'app_referrer_id'
    ) THEN
        ALTER TABLE activities DROP COLUMN app_referrer_id;
    END IF;
END $$;

-- Add the column with correct type
ALTER TABLE activities
ADD COLUMN IF NOT EXISTS app_referrer_id uuid;

-- Add foreign key constraint
ALTER TABLE activities
ADD CONSTRAINT fk_app_referrer
FOREIGN KEY (app_referrer_id)
REFERENCES profiles(id)
ON DELETE SET NULL;

-- Add comments for documentation
COMMENT ON COLUMN activities.customer_points IS 'Points earned/spent by the customer';
COMMENT ON COLUMN activities.referrer_points IS 'Points earned by the person who referred the customer to this restaurant';
COMMENT ON COLUMN activities.restaurant_recruiter_points IS 'Points earned by the person who recruited the restaurant';
COMMENT ON COLUMN activities.app_referrer_points IS 'Points earned by the person who referred the customer to the app';
COMMENT ON COLUMN activities.restaurant_deduction IS 'Points deducted from restaurant allocation';
COMMENT ON COLUMN activities.app_referrer_id IS 'ID of the user who referred the customer to the app';