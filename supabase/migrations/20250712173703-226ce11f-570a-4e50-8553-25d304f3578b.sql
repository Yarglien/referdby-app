-- Temporarily disable RLS to test if the insert works
ALTER TABLE dice_tokens DISABLE ROW LEVEL SECURITY;

-- Test insert a token manually 
INSERT INTO dice_tokens (
  restaurant_id,
  created_by,
  expires_at,
  is_active,
  token_state
) VALUES (
  'f8bcd5fd-9ece-40d4-bc99-10d4c8a870ab',
  'a0b782e1-76bf-4444-9cf8-c54146d3d6db',
  NOW() + INTERVAL '4 days',
  true,
  'created'
);

-- Re-enable RLS
ALTER TABLE dice_tokens ENABLE ROW LEVEL SECURITY;