-- Update the user's role to manager so they can save restaurant details
UPDATE profiles 
SET role = 'manager', updated_at = NOW() 
WHERE id = '23a18ffd-56bc-42c0-99e7-674b844e4081';