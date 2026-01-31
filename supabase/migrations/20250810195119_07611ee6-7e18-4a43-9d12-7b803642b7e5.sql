-- Add language preference to profiles table
ALTER TABLE public.profiles 
ADD COLUMN language_preference text DEFAULT 'en' CHECK (language_preference IN ('en', 'es', 'fr', 'de', 'it'));