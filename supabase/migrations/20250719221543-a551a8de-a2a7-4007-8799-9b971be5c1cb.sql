-- Create the missing profile for the manager who just signed up
INSERT INTO public.profiles (
  id,
  email,
  name,
  role,
  restaurant_id,
  referer_id
) VALUES (
  '87784a24-22aa-4168-853f-6521715ab276',
  'msteatham@rk.gmail.com',
  'msteatham',
  'manager',
  NULL,
  '23a18ffd-56bc-42c0-99e7-674b844e4081'
);

-- Mark the invite as used
UPDATE public.invites 
SET 
  used_at = NOW(),
  used_by = '87784a24-22aa-4168-853f-6521715ab276'
WHERE id = '82c32985-faad-4dc9-8b60-9a43046ed681';