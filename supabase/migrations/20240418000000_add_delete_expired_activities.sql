-- Drop the existing cron job that only marks activities as inactive
SELECT cron.unschedule('clean-expired-activities');

-- Create a new function to delete expired activities
CREATE OR REPLACE FUNCTION delete_expired_activities()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- First, mark them as inactive (keeping existing behavior)
  UPDATE activities
  SET is_active = false
  WHERE expires_at < NOW()
  AND is_active = true
  AND type = 'redeem_presented';

  -- Then delete activities that have been expired for more than 24 hours
  DELETE FROM activities
  WHERE expires_at < NOW() - INTERVAL '24 hours'
  AND type = 'redeem_presented';
END;
$$;

-- Create a new cron job to run once per day at midnight
SELECT cron.schedule(
  'delete-expired-activities',
  '0 0 * * *', -- Run at midnight every day
  $$
  SELECT delete_expired_activities();
  $$
);