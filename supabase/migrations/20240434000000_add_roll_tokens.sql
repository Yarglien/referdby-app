-- Create dice_tokens table if it doesn't exist
CREATE TABLE IF NOT EXISTS dice_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id) NOT NULL,
    restaurant_id UUID REFERENCES restaurants(id) NOT NULL,
    user_scanned_at TIMESTAMP WITH TIME ZONE,
    user_scanned_by UUID REFERENCES profiles(id),
    restaurant_scanned_at TIMESTAMP WITH TIME ZONE,
    restaurant_scanned_by UUID REFERENCES profiles(id),
    processed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    token_state TEXT CHECK (token_state IN ('created', 'user_scanned', 'restaurant_scanned', 'processed', 'expired')) DEFAULT 'created'
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_dice_tokens_restaurant_id ON dice_tokens(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_dice_tokens_created_by ON dice_tokens(created_by);
CREATE INDEX IF NOT EXISTS idx_dice_tokens_user_scanned_by ON dice_tokens(user_scanned_by);
CREATE INDEX IF NOT EXISTS idx_dice_tokens_restaurant_scanned_by ON dice_tokens(restaurant_scanned_by);
CREATE INDEX IF NOT EXISTS idx_dice_tokens_token_state ON dice_tokens(token_state);
CREATE INDEX IF NOT EXISTS idx_dice_tokens_is_active ON dice_tokens(is_active);

-- Convert existing int8 IDs to UUIDs if needed
DO $$
BEGIN
    -- Check if the table exists and has the old int8 id
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'dice_tokens'
        AND column_name = 'id'
        AND data_type = 'bigint'
    ) THEN
        -- Create a temporary table with the new structure
        CREATE TEMP TABLE temp_dice_tokens AS SELECT * FROM dice_tokens;
        
        -- Drop the original table
        DROP TABLE dice_tokens;
        
        -- Recreate the table with UUID
        CREATE TABLE dice_tokens (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_by UUID REFERENCES profiles(id) NOT NULL,
            restaurant_id UUID REFERENCES restaurants(id) NOT NULL,
            user_scanned_at TIMESTAMP WITH TIME ZONE,
            user_scanned_by UUID REFERENCES profiles(id),
            restaurant_scanned_at TIMESTAMP WITH TIME ZONE,
            restaurant_scanned_by UUID REFERENCES profiles(id),
            processed_at TIMESTAMP WITH TIME ZONE,
            expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
            is_active BOOLEAN DEFAULT true,
            token_state TEXT CHECK (token_state IN ('created', 'user_scanned', 'restaurant_scanned', 'processed', 'expired')) DEFAULT 'created'
        );
        
        -- Copy data from temporary table, generating new UUIDs
        INSERT INTO dice_tokens (
            id,
            created_at,
            created_by,
            restaurant_id,
            user_scanned_at,
            user_scanned_by,
            restaurant_scanned_at,
            restaurant_scanned_by,
            processed_at,
            expires_at,
            is_active,
            token_state
        )
        SELECT 
            gen_random_uuid(),
            created_at,
            created_by,
            restaurant_id,
            user_scanned_at,
            user_scanned_by,
            restaurant_scanned_at,
            restaurant_scanned_by,
            processed_at,
            expires_at,
            is_active,
            token_state
        FROM temp_dice_tokens;
        
        -- Drop the temporary table
        DROP TABLE temp_dice_tokens;
    END IF;
END $$;