-- Add expires_at column to referrals table
ALTER TABLE referrals
ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;

-- Create a function to automatically expire referrals
CREATE OR REPLACE FUNCTION expire_old_referrals()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE referrals
  SET status = 'expired'
  WHERE status = 'active'
    AND expires_at < NOW();
END;
$$;

-- Create a cron job to run the expiration function every hour
SELECT cron.schedule(
  'expire-old-referrals',
  '0 * * * *', -- Run every hour
  'SELECT expire_old_referrals();'
);

-- Add comment explaining the status transitions
COMMENT ON COLUMN referrals.status IS 'Status flow: active (created) -> used (claimed by user) -> scanned (processed by restaurant) -> expired (after 48h if still active)';