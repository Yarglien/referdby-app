-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension if not already enabled  
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule daily exchange rate updates at midnight UTC
SELECT cron.schedule(
  'update-exchange-rates-daily',
  '0 0 * * *', -- Every day at midnight UTC
  $$
  SELECT
    net.http_post(
        url:='https://lykukadtlhptlskrocux.supabase.co/functions/v1/update-exchange-rates',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5a3VrYWR0bGhwdGxza3JvY3V4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5MzgzMzEsImV4cCI6MjA0OTUxNDMzMX0.w-HRSLGr2vASi_35kWMxmTmY5iNb9l77R8oV0p8PjUg"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);

-- Verify the cron job was created
SELECT * FROM cron.job WHERE jobname = 'update-exchange-rates-daily';