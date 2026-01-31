-- Drop existing constraint if it exists
ALTER TABLE activities DROP CONSTRAINT IF EXISTS activities_referral_id_fkey;

-- Add foreign key constraint between activities and referrals
ALTER TABLE activities
ADD CONSTRAINT activities_referral_id_fkey 
FOREIGN KEY (referral_id) 
REFERENCES referrals(id);

-- Notify PostgREST to reload schema (both config and schema must be reloaded)
NOTIFY pgrst, 'reload config';
NOTIFY pgrst, 'reload schema';

-- Force schema cache refresh
COMMENT ON CONSTRAINT activities_referral_id_fkey ON activities IS 'Foreign key linking activities to referrals';