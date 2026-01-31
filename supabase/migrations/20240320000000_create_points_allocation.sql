-- Create points_allocation table
CREATE TABLE IF NOT EXISTS points_allocation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    type TEXT NOT NULL,
    percentage NUMERIC NOT NULL,
    description TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Insert initial percentage values
INSERT INTO points_allocation (type, percentage, description, is_active) VALUES
('customer', 15.0, 'Percentage of bill amount earned by paying customer', true),
('referrer', 4.0, 'Percentage of bill amount earned by visit referrer', true),
('restaurant_recruiter', 0.5, 'Percentage of bill amount earned by restaurant recruiter', true),
('app_referrer', 0.5, 'Percentage of bill amount earned by app referrer', true),
('restaurant_deduction', 20.0, 'Percentage of bill amount deducted from restaurant', true);

-- Add RLS policies
ALTER TABLE points_allocation ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "Allow read access to all authenticated users"
ON points_allocation FOR SELECT
TO authenticated
USING (true);

-- Allow insert/update/delete only for admin users
CREATE POLICY "Allow full access to admin users"
ON points_allocation FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Add comments for documentation
COMMENT ON TABLE points_allocation IS 'Stores percentage-based point allocation rules for different user types';
COMMENT ON COLUMN points_allocation.percentage IS 'Percentage of bill amount to be allocated as points';