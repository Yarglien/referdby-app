
-- Create exchange_rates table to store currency conversion rates
CREATE TABLE public.exchange_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  rate NUMERIC(12, 6) NOT NULL,
  fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  source TEXT DEFAULT 'yahoo_finance',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create unique index to prevent duplicate currency pairs
CREATE UNIQUE INDEX idx_exchange_rates_currencies 
ON public.exchange_rates(from_currency, to_currency) 
WHERE is_active = TRUE;

-- Create index for faster lookups by currency and date
CREATE INDEX idx_exchange_rates_lookup 
ON public.exchange_rates(from_currency, to_currency, fetched_at DESC);

-- Add RLS policies (rates should be readable by all authenticated users)
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read exchange rates
CREATE POLICY "Users can view exchange rates" 
  ON public.exchange_rates 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Only allow service role to insert/update rates (for background jobs)
CREATE POLICY "Service role can manage exchange rates" 
  ON public.exchange_rates 
  FOR ALL 
  TO service_role
  USING (true);

-- Insert some initial exchange rates for common currencies
INSERT INTO public.exchange_rates (from_currency, to_currency, rate, source)
VALUES 
  ('USD', 'USD', 1.000000, 'default'),
  ('EUR', 'USD', 1.100000, 'default'),
  ('GBP', 'USD', 1.270000, 'default'),
  ('CAD', 'USD', 0.740000, 'default'),
  ('AUD', 'USD', 0.670000, 'default'),
  ('JPY', 'USD', 0.007000, 'default'),
  ('CHF', 'USD', 1.050000, 'default'),
  ('CNY', 'USD', 0.140000, 'default'),
  ('INR', 'USD', 0.012000, 'default'),
  ('MXN', 'USD', 0.055000, 'default');

-- Create function to clean up old exchange rates (keep last 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_exchange_rates()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Keep only the most recent rate for each currency pair, plus any from last 30 days
  DELETE FROM exchange_rates 
  WHERE fetched_at < NOW() - INTERVAL '30 days'
  AND id NOT IN (
    SELECT DISTINCT ON (from_currency, to_currency) id
    FROM exchange_rates
    WHERE is_active = true
    ORDER BY from_currency, to_currency, fetched_at DESC
  );
END;
$$;
