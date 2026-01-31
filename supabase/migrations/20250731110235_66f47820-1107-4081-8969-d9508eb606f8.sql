-- Add publication status columns to restaurants table
ALTER TABLE public.restaurants 
ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS published_at timestamp with time zone;