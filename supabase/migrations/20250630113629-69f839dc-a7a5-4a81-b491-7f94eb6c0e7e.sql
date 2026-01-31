
-- Add currency column to restaurants table
ALTER TABLE public.restaurants 
ADD COLUMN currency text DEFAULT 'USD';

-- Update existing restaurants to have USD as default currency if they don't have one
UPDATE public.restaurants 
SET currency = 'USD' 
WHERE currency IS NULL;
