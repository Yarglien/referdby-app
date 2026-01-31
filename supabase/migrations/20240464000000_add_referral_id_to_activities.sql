-- Add referral_id column to activities table
ALTER TABLE activities
ADD COLUMN IF NOT EXISTS referral_id uuid REFERENCES referrals(id);

-- Add comment for documentation
COMMENT ON COLUMN activities.referral_id IS 'ID of the referral associated with this activity';

-- Update activities type definition to include referral_id
ALTER TYPE activity_type ADD VALUE IF NOT EXISTS 'referral_presented';