-- Fix trigger to validate invite requirements and log metadata properly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user_simple()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_invite_id TEXT;
  user_invite_type TEXT;
  user_restaurant_id TEXT;
  user_created_by TEXT;
  user_role TEXT := 'customer'; -- default role
BEGIN
  -- Log the user creation with ALL metadata
  RAISE NOTICE 'New user created: %', NEW.id;
  RAISE NOTICE 'Raw user meta data: %', NEW.raw_user_meta_data;
  RAISE NOTICE 'User meta data: %', NEW.user_metadata;
  
  -- Get metadata from raw_user_meta_data
  IF NEW.raw_user_meta_data IS NOT NULL THEN
    user_invite_id := NEW.raw_user_meta_data->>'invite_id';
    user_invite_type := NEW.raw_user_meta_data->>'invite_type';
    user_restaurant_id := NEW.raw_user_meta_data->>'restaurant_id';
    user_created_by := NEW.raw_user_meta_data->>'created_by';
    
    RAISE NOTICE 'Extracted from raw_user_meta_data - invite_id: %, invite_type: %, restaurant_id: %, created_by: %', 
      user_invite_id, user_invite_type, user_restaurant_id, user_created_by;
  END IF;

  -- ALSO check user_metadata field in case data is there instead
  IF NEW.user_metadata IS NOT NULL THEN
    RAISE NOTICE 'Checking user_metadata field...';
    IF user_invite_id IS NULL THEN
      user_invite_id := NEW.user_metadata->>'invite_id';
    END IF;
    IF user_invite_type IS NULL THEN
      user_invite_type := NEW.user_metadata->>'invite_type';
    END IF;
    IF user_restaurant_id IS NULL THEN
      user_restaurant_id := NEW.user_metadata->>'restaurant_id';
    END IF;
    IF user_created_by IS NULL THEN
      user_created_by := NEW.user_metadata->>'created_by';
    END IF;
    
    RAISE NOTICE 'After checking user_metadata - invite_id: %, invite_type: %, restaurant_id: %, created_by: %', 
      user_invite_id, user_invite_type, user_restaurant_id, user_created_by;
  END IF;

  -- Validate invite_type and assign role
  IF user_invite_type IS NOT NULL THEN
    CASE user_invite_type
      WHEN 'manager' THEN
        user_role := 'manager';
      WHEN 'admin' THEN  
        user_role := 'admin';
      WHEN 'server' THEN
        user_role := 'server';
      WHEN 'staff' THEN
        user_role := 'staff';
      ELSE
        RAISE EXCEPTION 'Invalid invite_type: %', user_invite_type;
    END CASE;
  END IF;

  RAISE NOTICE 'Final assigned role: %', user_role;

  -- Insert profile using correct column names
  INSERT INTO public.profiles (
    id,
    email,
    name,
    role,
    restaurant_id,
    referer_id
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    user_role,
    CASE WHEN user_restaurant_id IS NOT NULL THEN user_restaurant_id::uuid ELSE NULL END,
    CASE WHEN user_created_by IS NOT NULL THEN user_created_by::uuid ELSE NULL END
  );

  RAISE NOTICE 'Profile created for user: % with role: %', NEW.id, user_role;

  -- Update invite if invite_id was provided
  IF user_invite_id IS NOT NULL THEN
    UPDATE public.invites 
    SET 
      used_at = NOW(),
      used_by = NEW.id
    WHERE id = user_invite_id::uuid;
    
    RAISE NOTICE 'Updated invite: %', user_invite_id;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error in handle_new_user_simple: %', SQLERRM;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_simple();