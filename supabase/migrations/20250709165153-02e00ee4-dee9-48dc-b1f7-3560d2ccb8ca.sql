-- Add field to track if referral is invalid due to recent visit
ALTER TABLE referrals 
ADD COLUMN is_invalid_recent_visit boolean DEFAULT false;

-- Add comment for clarity
COMMENT ON COLUMN referrals.is_invalid_recent_visit IS 'True if the referred user has visited this restaurant in the last year';

-- Create function to check if user visited restaurant recently
CREATE OR REPLACE FUNCTION check_recent_restaurant_visit(p_user_id uuid, p_restaurant_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if user has any activity at this restaurant in the last year
    RETURN EXISTS (
        SELECT 1 
        FROM activities 
        WHERE user_id = p_user_id 
        AND restaurant_id = p_restaurant_id 
        AND created_at >= NOW() - INTERVAL '1 year'
        AND type IN ('referral_processed', 'redeem_processed')
    );
END;
$$;