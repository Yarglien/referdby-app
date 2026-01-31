-- Simple, focused fix: handle invite metadata properly and set manager role
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    user_role TEXT := 'customer';
    full_name TEXT;
    invite_identifier TEXT;
    invite_type_from_metadata TEXT;
    invite_creator_id UUID := NULL;
    invite_restaurant_id UUID := NULL;
BEGIN
    -- Get invite info from user metadata
    invite_identifier := NEW.raw_user_meta_data->>'invite_code';
    invite_type_from_metadata := NEW.raw_user_meta_data->>'invite_type';
    
    -- Log what we received
    RAISE LOG 'Processing new user %. Metadata invite_code: %, invite_type: %', 
        NEW.email, invite_identifier, invite_type_from_metadata;
    
    -- If we have invite type in metadata, use it directly
    IF invite_type_from_metadata IS NOT NULL THEN
        user_role := invite_type_from_metadata;
        RAISE LOG 'Setting role from metadata: %', user_role;
    END IF;
    
    -- If we have an invite identifier, look up additional details
    IF invite_identifier IS NOT NULL AND invite_identifier != '' THEN
        -- Check if it's a UUID (new system)
        IF invite_identifier ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
            SELECT created_by, restaurant_id, invite_type
            INTO invite_creator_id, invite_restaurant_id, user_role
            FROM invites 
            WHERE id = invite_identifier::uuid
            AND expires_at > NOW()
            LIMIT 1;
            
            RAISE LOG 'Found invite by UUID. Creator: %, Restaurant: %, Type: %', 
                invite_creator_id, invite_restaurant_id, user_role;
        ELSE
            -- Old style invite code
            SELECT created_by, restaurant_id, invite_type
            INTO invite_creator_id, invite_restaurant_id, user_role
            FROM invites 
            WHERE (invite_code = invite_identifier OR permanent_code = invite_identifier)
            AND (used_at IS NULL OR permanent_code IS NOT NULL)
            AND expires_at > NOW()
            LIMIT 1;
            
            RAISE LOG 'Found invite by code. Creator: %, Restaurant: %, Type: %', 
                invite_creator_id, invite_restaurant_id, user_role;
        END IF;
    END IF;
    
    -- Ensure role is valid
    IF user_role NOT IN ('customer', 'manager', 'server', 'admin') THEN
        user_role := 'customer';
    END IF;
    
    -- Handle name
    full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1)
    );
    
    -- Get default referer if none from invite
    IF invite_creator_id IS NULL THEN
        SELECT id INTO invite_creator_id
        FROM profiles 
        WHERE role IN ('manager', 'admin') 
        ORDER BY created_at 
        LIMIT 1;
    END IF;
    
    -- Create profile
    INSERT INTO public.profiles (
        id,
        email,
        role,
        join_date,
        name,
        first_name,
        last_name,
        referer_id,
        restaurant_id
    ) VALUES (
        NEW.id,
        NEW.email,
        user_role,
        CURRENT_DATE,
        full_name,
        COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(full_name, ' ', 1)),
        COALESCE(NEW.raw_user_meta_data->>'last_name', 
                 array_to_string(array_remove(string_to_array(full_name, ' '), split_part(full_name, ' ', 1)), ' ')),
        invite_creator_id,
        CASE WHEN user_role IN ('manager', 'server') THEN invite_restaurant_id ELSE NULL END
    );
    
    RAISE LOG 'Created profile for % with role % and restaurant_id %', 
        NEW.email, user_role, invite_restaurant_id;
    
    RETURN NEW;
END;
$function$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();