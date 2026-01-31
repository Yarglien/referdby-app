-- Fix the manager profile to be associated with the restaurant
UPDATE profiles 
SET restaurant_id = 'f8bcd5fd-9ece-40d4-bc99-10d4c8a870ab'
WHERE email = 'yarglien@gmail.com' AND role = 'manager';

-- Ensure the restaurant has roll meal offer enabled
UPDATE restaurants 
SET has_roll_meal_offer = true
WHERE id = 'f8bcd5fd-9ece-40d4-bc99-10d4c8a870ab';