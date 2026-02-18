-- Change exchange rate updates from daily to weekly (every 7 days)
-- Unschedule the old daily job
SELECT cron.unschedule('update-exchange-rates-daily');

-- Schedule weekly exchange rate updates (every Sunday at midnight UTC)
SELECT cron.schedule(
  'update-exchange-rates-weekly',
  '0 0 * * 0', -- Every Sunday at midnight UTC (every 7 days)
  $$
  SELECT
    net.http_post(
        url:='https://lykukadtlhptlskrocux.supabase.co/functions/v1/update-exchange-rates',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5a3VrYWR0bGhwdGxza3JvY3V4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5MzgzMzEsImV4cCI6MjA0OTUxNDMzMX0.w-HRSLGr2vASi_35kWMxmTmY5iNb9l77R8oV0p8PjUg"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);
