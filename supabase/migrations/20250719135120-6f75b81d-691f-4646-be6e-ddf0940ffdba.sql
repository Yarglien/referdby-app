CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    invite_record RECORD;
    user_role TEXT;
    full_name TEXT;
    default_referer_id UUID;
    invite_identifier TEXT;
    invite_found BOOLEAN := FALSE;
BEGIN
    -- Get a default referer (first manager/admin) as fallback
    SELECT id INTO default_referer_id
    FROM profiles 
    WHERE role IN ('manager', 'admin') 
    ORDER BY created_at 
    LIMIT 1;

    -- Get the invite identifier from user metadata
    invite_identifier := NEW.raw_user_meta_data->>'invite_code';
    
    -- Check if this is an invite ID (UUID format) or old style code
    IF invite_identifier IS NOT NULL THEN
        -- First try to find by ID (new system)
        IF invite_identifier ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
            SELECT * INTO invite_record 
            FROM invites 
            WHERE id = invite_identifier::uuid
            AND expires_at > NOW()
            LIMIT 1;
            
            IF FOUND THEN
                invite_found := TRUE;
            END IF;
        ELSE
            -- Fall back to old system: check both one-time and permanent invite codes
            SELECT * INTO invite_record 
            FROM invites 
            WHERE (
                -- Check one-time code
                (invite_code = invite_identifier 
                 AND used_at IS NULL 
                 AND expires_at > NOW())
                OR
                -- Check permanent code
                (permanent_code = invite_identifier)
            )
            LIMIT 1;
            
            IF FOUND THEN
                invite_found := TRUE;
            END IF;
        END IF;
    END IF;

    -- Set the default role
    user_role := 'customer';

    -- If there's a valid invite, update the role accordingly
    IF invite_found THEN
        CASE invite_record.invite_type
            WHEN 'manager' THEN user_role := 'manager';
            WHEN 'server' THEN user_role := 'server';
            ELSE user_role := 'customer';
        END CASE;

        -- For one-time codes, mark as used (but not for permanent codes or ID-based invites)
        IF invite_record.invite_code = invite_identifier AND invite_record.permanent_code IS NULL THEN
            UPDATE invites 
            SET used_at = NOW(), 
                used_by = NEW.id,
                email = NEW.email
            WHERE id = invite_record.id;
        -- For permanent codes or ID-based invites, create a record of usage
        ELSIF invite_record.permanent_code = invite_identifier OR invite_identifier ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
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
                invite_record.type,
                invite_record.invite_type,
                invite_record.restaurant_id,
                invite_record.created_by,
                gen_random_uuid()::text,
                invite_record.permanent_code,
                NOW(),
                NEW.id,
                NEW.email,
                NOW() + interval '30 days'
            );
        END IF;
    END IF;

    -- Handle name from raw user meta data or email
    IF NEW.raw_user_meta_data->>'full_name' IS NOT NULL THEN
        full_name := NEW.raw_user_meta_data->>'full_name';
    ELSIF NEW.raw_user_meta_data->>'name' IS NOT NULL THEN
        full_name := NEW.raw_user_meta_data->>'name';
    ELSE
        full_name := split_part(NEW.email, '@', 1);
    END IF;

    -- Create the profile with guaranteed referer_id
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
        -- Always ensure referer_id is set - use invite creator or default referer
        COALESCE(
            CASE WHEN invite_found THEN invite_record.created_by ELSE NULL END,
            default_referer_id
        ),
        -- Set restaurant_id for manager/server roles
        CASE 
            WHEN invite_found AND invite_record.invite_type IN ('manager', 'server') THEN invite_record.restaurant_id
            ELSE NULL
        END
    );

    RETURN NEW;
END;
$function$;