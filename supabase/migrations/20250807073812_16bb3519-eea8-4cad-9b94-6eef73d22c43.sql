-- Create external_restaurants table for Google Places results
CREATE TABLE public.external_restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id text UNIQUE NOT NULL,
  name text NOT NULL,
  address text NOT NULL,
  latitude numeric,
  longitude numeric,
  phone text,
  website text,
  photos text[],
  opening_hours jsonb DEFAULT '[]'::jsonb,
  cuisine_type text,
  currency text DEFAULT 'USD',
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.external_restaurants ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read external restaurants
CREATE POLICY "External restaurants are viewable by everyone" 
ON public.external_restaurants FOR SELECT USING (true);

-- Allow authenticated users to create external restaurants
CREATE POLICY "Users can create external restaurants" 
ON public.external_restaurants FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Update referrals table to support external restaurants
ALTER TABLE public.referrals 
ADD COLUMN external_restaurant_id uuid REFERENCES public.external_restaurants(id),
ADD COLUMN is_external boolean DEFAULT false;

-- Create index for better performance
CREATE INDEX idx_external_restaurants_place_id ON public.external_restaurants(place_id);
CREATE INDEX idx_referrals_external ON public.referrals(external_restaurant_id) WHERE is_external = true;