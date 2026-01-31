-- Create dice_tokens table with UUID primary key and all necessary columns
CREATE TABLE IF NOT EXISTS dice_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id) NOT NULL,
    restaurant_id UUID REFERENCES profiles(id) NOT NULL,
    user_scanned_at TIMESTAMP WITH TIME ZONE,
    user_scanned_by UUID REFERENCES profiles(id),
    restaurant_scanned_at TIMESTAMP WITH TIME ZONE,
    restaurant_scanned_by UUID REFERENCES profiles(id),
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID REFERENCES profiles(id),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    token_state TEXT CHECK (token_state IN ('created', 'user_scanned', 'restaurant_scanned', 'processed', 'expired')) DEFAULT 'created'
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_dice_tokens_restaurant_id ON dice_tokens(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_dice_tokens_created_by ON dice_tokens(created_by);
CREATE INDEX IF NOT EXISTS idx_dice_tokens_user_scanned_by ON dice_tokens(user_scanned_by);
CREATE INDEX IF NOT EXISTS idx_dice_tokens_restaurant_scanned_by ON dice_tokens(restaurant_scanned_by);
CREATE INDEX IF NOT EXISTS idx_dice_tokens_processed_by ON dice_tokens(processed_by);
CREATE INDEX IF NOT EXISTS idx_dice_tokens_token_state ON dice_tokens(token_state);
CREATE INDEX IF NOT EXISTS idx_dice_tokens_is_active ON dice_tokens(is_active);