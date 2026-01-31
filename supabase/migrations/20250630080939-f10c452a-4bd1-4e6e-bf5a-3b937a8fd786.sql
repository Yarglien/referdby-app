
-- Add home_currency column to profiles table if it doesn't exist
-- (The column already exists with default 'USD', but let's ensure it's properly set up)
DO $$ 
BEGIN
    -- Check if the column exists and update it if needed
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'profiles' AND column_name = 'home_currency') THEN
        -- Column exists, just ensure it has proper constraints
        ALTER TABLE profiles ALTER COLUMN home_currency SET DEFAULT 'USD';
    ELSE
        -- Add the column if it doesn't exist
        ALTER TABLE profiles ADD COLUMN home_currency text DEFAULT 'USD';
    END IF;
END $$;

-- Add a check constraint to limit supported currencies
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_home_currency_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_home_currency_check 
CHECK (home_currency IN (
    'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'SEK', 'NOK', 'DKK',
    'PLN', 'CZK', 'HUF', 'BGN', 'RON', 'HRK', 'RSD', 'MKD', 'BAM', 'ALL',
    'TRY', 'RUB', 'UAH', 'BYN', 'MDL', 'GEL', 'AMD', 'AZN', 'KZT', 'UZS',
    'KGS', 'TJS', 'TMT', 'MNT', 'CNY', 'HKD', 'TWD', 'KRW', 'SGD', 'MYR',
    'THB', 'IDR', 'PHP', 'VND', 'LAK', 'KHR', 'MMK', 'BDT', 'PKR', 'LKR',
    'NPR', 'BTN', 'MVR', 'INR', 'AFN', 'IRR', 'IQD', 'JOD', 'KWD', 'LBP',
    'OMR', 'QAR', 'SAR', 'SYP', 'AED', 'YER', 'BHD', 'ILS', 'EGP', 'LYD',
    'MAD', 'TND', 'DZD', 'SDG', 'ETB', 'KES', 'UGX', 'TZS', 'RWF', 'BIF',
    'DJF', 'ERN', 'SOS', 'SCR', 'MUR', 'MGA', 'KMF', 'SZL', 'LSL', 'BWP',
    'NAD', 'ZAR', 'ZMW', 'ZWL', 'MWK', 'MZN', 'AOA', 'CDF', 'XAF', 'XOF',
    'GHS', 'NGN', 'SLE', 'LRD', 'GMD', 'GNF', 'CVE', 'STN', 'CLP', 'ARS',
    'UYU', 'PYG', 'BOB', 'BRL', 'PEN', 'COP', 'VES', 'GYD', 'SRD', 'FKP',
    'MXN', 'GTQ', 'BZD', 'SVC', 'HNL', 'NIO', 'CRC', 'PAB', 'CUP', 'DOP',
    'HTG', 'JMD', 'KYD', 'XCD', 'TTD', 'BBD', 'BMD', 'BSD', 'AWG', 'ANG',
    'FJD', 'SBD', 'TOP', 'VUV', 'WST', 'PGK', 'NCF', 'NZD'
));
