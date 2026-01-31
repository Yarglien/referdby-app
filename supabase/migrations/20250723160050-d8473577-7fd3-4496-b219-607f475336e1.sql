-- Create table to track restaurant feedback
CREATE TABLE public.restaurant_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id UUID NOT NULL REFERENCES public.activities(id),
  restaurant_id UUID NOT NULL,
  customer_id UUID NOT NULL,
  email_sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  response_given_at TIMESTAMP WITH TIME ZONE,
  would_return BOOLEAN,
  feedback_token UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.restaurant_feedback ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own feedback entries" 
ON public.restaurant_feedback 
FOR SELECT 
USING (auth.uid() = customer_id);

CREATE POLICY "Service role can manage feedback" 
ON public.restaurant_feedback 
FOR ALL 
USING (auth.role() = 'service_role');

-- Create index for better performance
CREATE INDEX idx_restaurant_feedback_token ON public.restaurant_feedback(feedback_token);
CREATE INDEX idx_restaurant_feedback_restaurant ON public.restaurant_feedback(restaurant_id);

-- Add computed column to restaurants for return rate
ALTER TABLE public.restaurants 
ADD COLUMN return_rate NUMERIC DEFAULT NULL;