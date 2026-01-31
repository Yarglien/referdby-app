
-- Add require_bill_photos column to restaurants table
ALTER TABLE restaurants 
ADD COLUMN require_bill_photos boolean DEFAULT true;

-- Add comment to explain the column
COMMENT ON COLUMN restaurants.require_bill_photos IS 'Whether bill photos are required when processing bills and redemptions for this restaurant';
