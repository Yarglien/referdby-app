-- Add distance_unit preference to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS distance_unit text DEFAULT 'miles' CHECK (distance_unit IN ('miles', 'km'));