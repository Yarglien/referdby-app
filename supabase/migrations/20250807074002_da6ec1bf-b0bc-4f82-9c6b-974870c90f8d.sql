-- Make restaurant_id nullable for external referrals
ALTER TABLE public.referrals 
ALTER COLUMN restaurant_id DROP NOT NULL;