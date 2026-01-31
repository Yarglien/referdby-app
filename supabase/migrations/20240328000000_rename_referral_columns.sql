-- Rename used_at to scanned_at
ALTER TABLE referrals 
RENAME COLUMN used_at TO scanned_at;

-- Rename used_by_id to scanned_by_id
ALTER TABLE referrals 
RENAME COLUMN used_by_id TO scanned_by_id;

-- Add comment to explain the columns
COMMENT ON COLUMN referrals.scanned_at IS 'Timestamp when the referral was scanned';
COMMENT ON COLUMN referrals.scanned_by_id IS 'ID of the user who scanned the referral';