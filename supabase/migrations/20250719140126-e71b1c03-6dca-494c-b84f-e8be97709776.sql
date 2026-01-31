-- Drop and recreate the trigger and function with a completely different approach
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create function without using RECORD variables at all
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    user_role TEXT := 'customer';
    full_name TEXT;
    default_referer_id UUID := NULL;
    invite_identifier TEXT;
    invite_creator_id UUID := NULL;
    invite_restaurant_id UUID := NULL;
    invite_type_found TEXT := NULL;
    invite_id_found UUID := NULL;
    invite_code_found TEXT := NULL;
    invite_permanent_code TEXT := NULL;
BEGIN
    -- Get a default referer (first manager/admin) as fallback
    SELECT id INTO default_referer_id
    FROM profiles 
    WHERE role IN ('manager', 'admin') 
    ORDER BY created_at 
    LIMIT 1;

    -- Get the invite identifier from user metadata
    invite_identifier := NEW.raw_user_meta_data->>'invite_code';
    
    -- Only process invites if we have an invite identifier
    IF invite_identifier IS NOT NULL AND invite_identifier != '' THEN
        -- Check if this is an invite ID (UUID format)
        IF invite_identifier ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
            -- Look up by UUID
            SELECT id, invite_type, created_by, restaurant_id, invite_code, permanent_code
            INTO invite_id_found, invite_type_found, invite_creator_id, invite_restaurant_id, invite_code_found, invite_permanent_code
            FROM invites 
            WHERE id = invite_identifier::uuid
            AND expires_at > NOW()
            LIMIT 1;
        ELSE
            -- Look up by invite code or permanent code
            SELECT id, invite_type, created_by, restaurant_id, invite_code, permanent_code
            INTO invite_id_found, invite_type_found, invite_creator_id, invite_restaurant_id, invite_code_found, invite_permanent_code
            FROM invites 
            WHERE (
                (invite_code = invite_identifier AND used_at IS NULL AND expires_at > NOW())
                OR
                (permanent_code = invite_identifier)
            )
            LIMIT 1;
        END IF;
    END IF;

    -- Process the invite if we found one
    IF invite_id_found IS NOT NULL THEN
        -- Set role based on invite type
        CASE invite_type_found
            WHEN 'manager' THEN user_role := 'manager';
            WHEN 'server' THEN user_role := 'server';
            ELSE user_role := 'customer';
        END CASE;

        -- Mark one-time codes as used (but not permanent codes or UUID-based invites)
        IF invite_code_found = invite_identifier AND invite_permanent_code IS NULL THEN
            UPDATE invites 
            SET used_at = NOW(), 
                used_by = NEW.id,
                email = NEW.email
            WHERE id = invite_id_found;
        ELSIF invite_permanent_code = invite_identifier OR invite_identifier ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
            -- Create usage record for permanent codes or UUID invites
            INSERT INTO invites (
                type,
                invite_type,
                restaurant_id,
                created_by,
                invite_code,
                permanent_code,
                used_at,
                used_by,
                email,
                expires_at
            ) VALUES (
                invite_type_found::invite_type,
                invite_type_found,
                invite_restaurant_id,
                invite_creator_id,
                gen_random_uuid()::text,
                invite_permanent_code,
                NOW(),
                NEW.id,
                NEW.email,
                NOW() + interval '30 days'
            );
        END IF;
    END IF;

    -- Handle user name from metadata or email
    IF NEW.raw_user_meta_data->>'full_name' IS NOT NULL THEN
        full_name := NEW.raw_user_meta_data->>'full_name';
    ELSIF NEW.raw_user_meta_data->>'name' IS NOT NULL THEN
        full_name := NEW.raw_user_meta_data->>'name';
    ELSE
        full_name := split_part(NEW.email, '@', 1);
    END IF;

    -- Create the user profile
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
    )
    VALUES (
        NEW.id,
        NEW.email,
        user_role,
        CURRENT_DATE,
        full_name,
        CASE 
            WHEN NEW.raw_user_meta_data->>'first_name' IS NOT NULL THEN NEW.raw_user_meta_data->>'first_name'
            ELSE split_part(full_name, ' ', 1)
        END,
        CASE 
            WHEN NEW.raw_user_meta_data->>'last_name' IS NOT NULL THEN NEW.raw_user_meta_data->>'last_name'
            ELSE array_to_string(array_remove(string_to_array(full_name, ' '), split_part(full_name, ' ', 1)), ' ')
        END,
        -- Set referer_id from invite or use default
        COALESCE(invite_creator_id, default_referer_id),
        -- Set restaurant_id for staff roles
        CASE 
            WHEN invite_type_found IN ('manager', 'server') THEN invite_restaurant_id
            ELSE NULL
        END
    );

    RETURN NEW;
END;
$function$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();