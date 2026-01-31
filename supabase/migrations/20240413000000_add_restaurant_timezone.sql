-- Add timezone column to restaurants table
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/New_York';

-- Add comment for documentation
COMMENT ON COLUMN restaurants.timezone IS 'Timezone for the restaurant (e.g., America/New_York)';

-- Refresh the schema cache to ensure PostgREST sees the new column
NOTIFY pgrst, 'reload schema';