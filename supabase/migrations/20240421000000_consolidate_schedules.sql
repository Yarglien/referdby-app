-- First, add the new JSONB columns to restaurants
ALTER TABLE restaurants 
ADD COLUMN opening_hours_schedule JSONB DEFAULT '[]',
ADD COLUMN redemption_schedule JSONB DEFAULT '[]';

-- Migrate existing opening hours data
UPDATE restaurants r
SET opening_hours_schedule = (
  SELECT json_agg(json_build_object(
    'day_of_week', oh.day_of_week,
    'is_open', oh.is_open,
    'open_time', oh.open_time,
    'close_time', oh.close_time
  ))
  FROM opening_hours oh
  WHERE oh.restaurant_id = r.id
);

-- Migrate existing redemption schedule data
UPDATE restaurants r
SET redemption_schedule = (
  SELECT json_agg(json_build_object(
    'day_of_week', rs.day_of_week,
    'is_open', rs.is_open,
    'open_time', rs.open_time,
    'close_time', rs.close_time
  ))
  FROM redemption_schedule rs
  WHERE rs.restaurant_id = r.id
);

-- Drop the old tables
DROP TABLE opening_hours;
DROP TABLE redemption_schedule;