-- Create a function to clean up unused dice tokens
CREATE OR REPLACE FUNCTION cleanup_unused_dice_tokens()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Delete tokens that were created but not scanned within 1 hour
  DELETE FROM dice_tokens
  WHERE user_scanned_at IS NULL
  AND created_at < NOW() - INTERVAL '1 hour';

  -- Delete tokens that were scanned but not used within 120 hours of being scanned
  DELETE FROM dice_tokens
  WHERE user_scanned_at IS NOT NULL
  AND used_at IS NULL
  AND user_scanned_at < NOW() - INTERVAL '120 hours';
END;
$$;

-- Create a cron job to run the cleanup function every hour
SELECT cron.schedule(
  'cleanup-unused-dice-tokens',
  '0 * * * *', -- Run every hour
  'SELECT cleanup_unused_dice_tokens();'
);