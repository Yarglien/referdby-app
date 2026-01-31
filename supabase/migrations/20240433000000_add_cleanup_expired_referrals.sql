-- Create a function to delete expired referrals
CREATE OR REPLACE FUNCTION cleanup_expired_referrals()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM referrals
  WHERE status = 'expired';
END;
$$;

-- Create a cron job to run the cleanup function daily at midnight
SELECT cron.schedule(
  'cleanup-expired-referrals',
  '0 0 * * *', -- Run at midnight every day
  'SELECT cleanup_expired_referrals();'
);