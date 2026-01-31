-- First create the enum type
DROP TYPE IF EXISTS activity_type CASCADE;
CREATE TYPE activity_type AS ENUM (
    'referral_presented',
    'referral_scanned',
    'referral_processed',
    'redeem_presented',
    'redeem_scanned',
    'redeem_processed'
);

-- Add the column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 
                  FROM information_schema.columns 
                  WHERE table_name='activities' 
                  AND column_name='type') THEN
        ALTER TABLE activities ADD COLUMN type activity_type DEFAULT 'referral_presented'::activity_type;
    END IF;
END $$;

-- Add documentation
COMMENT ON TYPE activity_type IS 'Types of activities: referral (presented/scanned/processed) and redeem (presented/scanned/processed)';