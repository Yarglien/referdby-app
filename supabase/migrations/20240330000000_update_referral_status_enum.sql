-- First drop the existing enum type constraints
ALTER TABLE referrals 
    ALTER COLUMN status DROP DEFAULT;

-- Update the enum type
DROP TYPE IF EXISTS referral_status;
CREATE TYPE referral_status AS ENUM ('active', 'scanned', 'used', 'expired');

-- Update the column to use the new enum type
ALTER TABLE referrals
    ALTER COLUMN status TYPE referral_status USING status::text::referral_status,
    ALTER COLUMN status SET DEFAULT 'active';

-- Add comment to document the enum values
COMMENT ON TYPE referral_status IS 'Status of a referral: active (newly created), scanned (claimed by user), used (redeemed at restaurant), expired';