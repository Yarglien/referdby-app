-- Ensure the columns exist with the correct names
DO $$ 
BEGIN
    -- Check if scanned_at column exists, if not create it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'referrals' AND column_name = 'scanned_at') THEN
        ALTER TABLE referrals ADD COLUMN scanned_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Check if scanned_by_id column exists, if not create it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'referrals' AND column_name = 'scanned_by_id') THEN
        ALTER TABLE referrals ADD COLUMN scanned_by_id UUID REFERENCES profiles(id);
    END IF;
END $$;

-- Add comments to document the columns
COMMENT ON COLUMN referrals.scanned_at IS 'Timestamp when the referral was scanned';
COMMENT ON COLUMN referrals.scanned_by_id IS 'ID of the user who scanned the referral';