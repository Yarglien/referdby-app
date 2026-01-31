-- Add points_redeemed column to activities table
ALTER TABLE activities
ADD COLUMN points_redeemed INTEGER DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN activities.points_redeemed IS 'Number of points redeemed in this activity';