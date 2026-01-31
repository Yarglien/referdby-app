-- Drop existing enum type (must drop any constraints/columns using it first)
ALTER TABLE activities 
  ALTER COLUMN type DROP DEFAULT,
  ALTER COLUMN type TYPE text;

DROP TYPE IF EXISTS activity_type;

-- Recreate enum with new values
CREATE TYPE activity_type AS ENUM (
  'referral_presented',
  'referral_scanned',
  'referral_processed',
  'redeem_presented',
  'redeem_scanned',
  'redeem_processed'
);

-- Update column to use new enum
ALTER TABLE activities
  ALTER COLUMN type TYPE activity_type USING type::activity_type,
  ALTER COLUMN type SET DEFAULT 'referral_presented'::activity_type;