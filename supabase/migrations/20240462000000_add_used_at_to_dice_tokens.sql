-- Add used_at column to dice_tokens table
ALTER TABLE dice_tokens 
ADD COLUMN IF NOT EXISTS used_at TIMESTAMP WITH TIME ZONE;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_dice_tokens_used_at ON dice_tokens(used_at);