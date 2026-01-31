-- First, drop existing policies that depend on the enum
DROP POLICY IF EXISTS "Users can claim referrals" ON referrals;

-- Create the new enum type
DROP TYPE IF EXISTS referral_status CASCADE;
CREATE TYPE referral_status AS ENUM ('active', 'scanned', 'used', 'expired');

-- Update the column to use the new enum type
ALTER TABLE referrals
    DROP COLUMN IF EXISTS status,
    ADD COLUMN status referral_status NOT NULL DEFAULT 'active';

-- Recreate the policy
CREATE POLICY "Users can claim referrals" ON referrals
    FOR UPDATE
    USING (true)
    WITH CHECK (
        status = 'active'::referral_status AND
        auth.uid() IS NOT NULL
    );

-- Add documentation
COMMENT ON TYPE referral_status IS 'Status of a referral: active (newly created), scanned (claimed by user), used (redeemed at restaurant), expired';