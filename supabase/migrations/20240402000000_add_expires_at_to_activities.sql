ALTER TABLE activities
ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;

-- Create a function to clean expired activities
CREATE OR REPLACE FUNCTION clean_expired_activities()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE activities
  SET is_active = false
  WHERE expires_at < NOW()
  AND is_active = true
  AND type = 'redeem_presented';
END;
$$;

-- Create a cron job to run every hour
SELECT cron.schedule(
  'clean-expired-activities',
  '0 * * * *', -- Run every hour
  $$
  SELECT clean_expired_activities();
  $$
);