-- Fix the profiles table to allow NULL referer_id
ALTER TABLE public.profiles ALTER COLUMN referer_id DROP NOT NULL;