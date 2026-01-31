-- Add scanner_id column to activities table
ALTER TABLE activities
ADD COLUMN IF NOT EXISTS scanner_id uuid REFERENCES profiles(id);

-- Add comment explaining the columns
COMMENT ON COLUMN activities.scanner_id IS 'ID of the user who initially scanned the QR code';
COMMENT ON COLUMN activities.processed_by_id IS 'ID of the manager or server who processed the bill';

-- Move existing processed_by_id values to scanner_id where appropriate
UPDATE activities 
SET scanner_id = processed_by_id,
    processed_by_id = NULL
WHERE type = 'referral_presented' 
AND processed_by_id IS NOT NULL 
AND amount_spent IS NULL;