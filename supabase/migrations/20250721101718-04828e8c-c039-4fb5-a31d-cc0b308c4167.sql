-- Fix customer role for yarglien@yahoo.com
UPDATE profiles 
SET role = 'customer' 
WHERE email = 'yarglien@yahoo.com';