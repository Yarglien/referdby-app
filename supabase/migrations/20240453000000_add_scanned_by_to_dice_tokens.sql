-- Drop existing column if it exists to avoid conflicts
ALTER TABLE dice_tokens 
DROP COLUMN IF EXISTS scanned_by;

-- Add scanned_by column to dice_tokens table
ALTER TABLE dice_tokens 
ADD COLUMN scanned_by UUID REFERENCES profiles(id);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_dice_tokens_scanned_by ON dice_tokens(scanned_by);

-- Update RLS policies to allow scanned_by updates
CREATE POLICY "Enable update of scanned_by for authenticated users" ON dice_tokens
FOR UPDATE
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);