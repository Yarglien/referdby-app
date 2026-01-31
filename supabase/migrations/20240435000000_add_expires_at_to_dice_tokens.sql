-- Add expires_at column to dice_tokens table
ALTER TABLE IF EXISTS dice_tokens 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Update existing tokens to have an expiry date 4 days from their creation
UPDATE dice_tokens
SET expires_at = created_at + INTERVAL '4 days'
WHERE expires_at IS NULL;

-- Make expires_at required for future tokens
ALTER TABLE dice_tokens
ALTER COLUMN expires_at SET NOT NULL;