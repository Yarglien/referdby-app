ALTER TABLE activities
ADD COLUMN scanned_at TIMESTAMP WITH TIME ZONE;

-- Update existing records to use created_at as scanned_at
UPDATE activities 
SET scanned_at = created_at 
WHERE type = 'referral_presented';