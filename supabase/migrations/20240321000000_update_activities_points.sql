-- Add columns for different point allocations
ALTER TABLE activities
ADD COLUMN customer_points integer,
ADD COLUMN referrer_points integer,
ADD COLUMN restaurant_recruiter_points integer,
ADD COLUMN app_referrer_points integer,
ADD COLUMN restaurant_deduction integer;

-- Migrate existing points_change data to customer_points
UPDATE activities 
SET customer_points = points_change
WHERE points_change IS NOT NULL;

-- Add comment explaining the columns
COMMENT ON COLUMN activities.customer_points IS 'Points earned/spent by the customer';
COMMENT ON COLUMN activities.referrer_points IS 'Points earned by the person who referred the customer to this restaurant';
COMMENT ON COLUMN activities.restaurant_recruiter_points IS 'Points earned by the person who recruited the restaurant';
COMMENT ON COLUMN activities.app_referrer_points IS 'Points earned by the person who referred the customer to the app';
COMMENT ON COLUMN activities.restaurant_deduction IS 'Points deducted from restaurant allocation';

-- We'll keep points_change for backward compatibility temporarily
-- but mark it as deprecated
COMMENT ON COLUMN activities.points_change IS 'DEPRECATED: Use specific point columns instead';