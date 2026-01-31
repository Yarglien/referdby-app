-- Convert current_points column to numeric if it's not already
DO $$ 
BEGIN
    -- First, ensure any NULL values are set to 0
    UPDATE restaurants 
    SET current_points = '0' 
    WHERE current_points IS NULL;

    -- Then alter the column type to numeric
    ALTER TABLE restaurants 
    ALTER COLUMN current_points TYPE numeric USING current_points::numeric;

    -- Set default value and not null constraint
    ALTER TABLE restaurants 
    ALTER COLUMN current_points SET DEFAULT 0,
    ALTER COLUMN current_points SET NOT NULL;
END $$;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';