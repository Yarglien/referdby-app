-- Fix the handle_new_user function to properly set referer_id
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
BEGIN
    -- Check for both one-time and permanent invite codes
    SELECT * INTO invite_record 
    FROM invites 
    WHERE (
        -- Check one-time code
        (invite_code = NEW.raw_user_meta_data->>'invite_code' 
         AND used_at IS NULL 
         AND expires_at > NOW())
        OR
        -- Check permanent code
        (permanent_code = NEW.raw_user_meta_data->>'invite_code')
    )
    LIMIT 1;

    -- Set the default role
    user_role := 'customer';

    -- If there's a valid invite, update the role accordingly
    IF FOUND THEN
        CASE invite_record.type
            WHEN 'manager' THEN user_role := 'manager';
            WHEN 'server' THEN user_role := 'server';
            ELSE user_role := 'customer';
        END CASE;

        -- For one-time codes, mark as used
        IF invite_record.invite_code = NEW.raw_user_meta_data->>'invite_code' THEN
            UPDATE invites 
            SET used_at = NOW(), 
                used_by = NEW.id,
                email = NEW.email
            WHERE id = invite_record.id;
        -- For permanent codes, create a record of usage
        ELSIF invite_record.permanent_code = NEW.raw_user_meta_data->>'invite_code' THEN
            INSERT INTO invites (
                type,
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
                invite_record.restaurant_id,
                invite_record.created_by,
                gen_random_uuid()::text, -- Generate a unique one-time code
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

    -- Create the profile
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
        -- Set referer_id to the person who created the invite (if invite was used)
        CASE 
            WHEN FOUND THEN invite_record.created_by
            ELSE NULL
        END,
        -- Set restaurant_id for manager/server roles
        CASE 
            WHEN FOUND AND invite_record.type IN ('manager', 'server') THEN invite_record.restaurant_id
            ELSE NULL
        END
    );

    RETURN NEW;
END;
$function$