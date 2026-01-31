-- Fix the trigger function to use the correct column names for profiles table
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
  -- Log the user creation
  RAISE NOTICE 'New user created: %', NEW.id;
  RAISE NOTICE 'Raw user meta data: %', NEW.raw_user_meta_data;
  
  -- Get metadata from raw_user_meta_data (this is the correct field name)
  IF NEW.raw_user_meta_data IS NOT NULL THEN
    user_invite_id := NEW.raw_user_meta_data->>'invite_id';
    user_invite_type := NEW.raw_user_meta_data->>'invite_type';
    user_restaurant_id := NEW.raw_user_meta_data->>'restaurant_id';
    user_created_by := NEW.raw_user_meta_data->>'created_by';
    
    RAISE NOTICE 'Extracted from raw_user_meta_data - invite_id: %, invite_type: %, restaurant_id: %, created_by: %', 
      user_invite_id, user_invite_type, user_restaurant_id, user_created_by;
  END IF;

  -- Validate invite_type and assign role
  IF user_invite_type IS NOT NULL THEN
    CASE user_invite_type
      WHEN 'manager' THEN
        user_role := 'manager';
      WHEN 'admin' THEN  
        user_role := 'admin';
      WHEN 'staff' THEN
        user_role := 'staff';
      ELSE
        RAISE EXCEPTION 'Invalid invite_type: %', user_invite_type;
    END CASE;
  END IF;

  RAISE NOTICE 'Assigned role: %', user_role;

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
    CASE WHEN user_created_by IS NOT NULL THEN user_created_by ELSE NULL END
  );

  RAISE NOTICE 'Profile created for user: %', NEW.id;

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