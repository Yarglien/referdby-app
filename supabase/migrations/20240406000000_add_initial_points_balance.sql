-- Add initial_points_balance column if it doesn't exist
ALTER TABLE activities
ADD COLUMN IF NOT EXISTS initial_points_balance text;

-- Add comment for the column
COMMENT ON COLUMN activities.initial_points_balance IS 'User points balance at time of activity creation';

-- Create postgrest schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS postgrest;

-- Create or replace the rebuild function
CREATE OR REPLACE FUNCTION postgrest.rebuild_schema_cache()
RETURNS void AS $$
BEGIN
    NOTIFY pgrst, 'reload schema';
END;
$$ LANGUAGE plpgsql;

-- Execute the rebuild
SELECT postgrest.rebuild_schema_cache();