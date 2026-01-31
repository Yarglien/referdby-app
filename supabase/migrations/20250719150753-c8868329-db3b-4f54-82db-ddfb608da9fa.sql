-- Simple, clean user creation trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user_simple()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    user_role TEXT := 'customer';
    invite_id_from_meta TEXT;
    invite_type_from_meta TEXT;
    restaurant_id_from_meta TEXT;
    created_by_from_meta TEXT;
BEGIN
    -- Get data from user metadata (set during signup)
    invite_id_from_meta := NEW.raw_user_meta_data->>'invite_id';
    invite_type_from_meta := NEW.raw_user_meta_data->>'invite_type';
    restaurant_id_from_meta := NEW.raw_user_meta_data->>'restaurant_id';
    created_by_from_meta := NEW.raw_user_meta_data->>'created_by';
    
    -- Use the invite type if provided, otherwise default to customer
    IF invite_type_from_meta IS NOT NULL THEN
        user_role := invite_type_from_meta;
    END IF;
    
    -- Log what we're doing
    RAISE LOG 'Creating user % with role % from invite %', 
        NEW.email, user_role, invite_id_from_meta;
    
    -- Create profile with the role from invite
    INSERT INTO public.profiles (
        id,
        email,
        role,
        name,
        restaurant_id,
        referer_id,
        join_date
    ) VALUES (
        NEW.id,
        NEW.email,
        user_role,
        split_part(NEW.email, '@', 1), -- Simple name from email
        CASE WHEN user_role IN ('manager', 'server') THEN restaurant_id_from_meta::uuid ELSE NULL END,
        created_by_from_meta,
        CURRENT_DATE
    );
    
    -- Mark invite as used if it was provided
    IF invite_id_from_meta IS NOT NULL THEN
        UPDATE invites 
        SET used_at = NOW(), used_by = NEW.id 
        WHERE id = invite_id_from_meta::uuid;
    END IF;
    
    RETURN NEW;
END;
$function$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_simple();