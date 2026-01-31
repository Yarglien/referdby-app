-- Create points sharing table
CREATE TABLE IF NOT EXISTS public.points_sharing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  points_amount numeric NOT NULL,
  sender_currency text NOT NULL DEFAULT 'USD',
  share_code text UNIQUE NOT NULL,
  is_used boolean DEFAULT false NOT NULL,
  used_at timestamp with time zone,
  expires_at timestamp with time zone NOT NULL,
  CONSTRAINT positive_points CHECK (points_amount > 0)
);

-- Enable RLS
ALTER TABLE public.points_sharing ENABLE ROW LEVEL SECURITY;

-- Senders can view their own sharing records
CREATE POLICY "Users can view their sent points"
ON public.points_sharing
FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can create sharing codes
CREATE POLICY "Users can create points sharing"
ON public.points_sharing
FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Users can claim/use codes
CREATE POLICY "Users can claim points"
ON public.points_sharing
FOR UPDATE
USING (is_used = false AND expires_at > now())
WITH CHECK (auth.uid() = receiver_id);

-- Add index for faster lookups
CREATE INDEX idx_points_sharing_code ON public.points_sharing(share_code);
CREATE INDEX idx_points_sharing_sender ON public.points_sharing(sender_id);
CREATE INDEX idx_points_sharing_receiver ON public.points_sharing(receiver_id);