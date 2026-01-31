-- Add logging to the process_bill_transaction function to debug the issue
CREATE OR REPLACE FUNCTION process_bill_transaction(
  p_activity_id uuid,
  p_app_referrer_id uuid,
  p_app_referrer_points integer,
  p_bill_image text,
  p_bill_total numeric,
  p_customer_id uuid,
  p_customer_points integer,
  p_initial_points_balance integer,
  p_new_restaurant_points numeric,
  p_points_distribution jsonb,
  p_processed_by_id uuid,
  p_referrer_points integer,
  p_restaurant_deduction integer,
  p_restaurant_id uuid,
  p_restaurant_recruiter_points integer,
  p_restaurant_referrer_id uuid,
  p_user_referrer_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_description text;
  v_restaurant_name text;
  v_customer_update_count integer;
  v_referrer_update_count integer;
  v_app_referrer_update_count integer;
  v_restaurant_recruiter_update_count integer;
BEGIN
  -- Get restaurant name for descriptions
  SELECT name INTO v_restaurant_name
  FROM restaurants
  WHERE id = p_restaurant_id;

  -- Update the original activity with all processing details
  UPDATE activities
    SET type = 'referral_processed',
        amount_spent = p_bill_total,
        receipt_photo = p_bill_image,
        processed_by_id = p_processed_by_id,
        customer_points = p_customer_points,
        referrer_points = p_referrer_points,
        restaurant_recruiter_points = p_restaurant_recruiter_points,
        app_referrer_points = p_app_referrer_points,
        restaurant_deduction = p_restaurant_deduction,
        restaurant_referrer_id = p_restaurant_referrer_id,
        user_referrer_id = p_user_referrer_id,
        app_referrer_id = p_app_referrer_id,
        initial_points_balance = p_initial_points_balance,
        description = CASE 
          WHEN user_id = p_customer_id THEN 'Meal purchase at ' || v_restaurant_name
          WHEN user_id = p_user_referrer_id THEN 'Earned points from referral used at ' || v_restaurant_name
          WHEN user_id = p_restaurant_referrer_id THEN 'Earned points from recruited restaurant ' || v_restaurant_name
          WHEN user_id = p_app_referrer_id THEN 'Earned points from app referral used at ' || v_restaurant_name
        END
    WHERE id = p_activity_id;

  -- Update customer points
  UPDATE profiles
    SET current_points = current_points + p_customer_points
    WHERE id = p_customer_id;
  
  GET DIAGNOSTICS v_customer_update_count = ROW_COUNT;

  -- Update referrer points if applicable
  IF p_user_referrer_id IS NOT NULL AND p_user_referrer_id != p_customer_id THEN
    UPDATE profiles
      SET current_points = current_points + p_referrer_points
      WHERE id = p_user_referrer_id;
    
    GET DIAGNOSTICS v_referrer_update_count = ROW_COUNT;
  ELSE
    v_referrer_update_count := 0;
  END IF;

  -- Update restaurant recruiter points if applicable
  IF p_restaurant_referrer_id IS NOT NULL AND p_restaurant_referrer_id != p_customer_id THEN
    UPDATE profiles
      SET current_points = current_points + p_restaurant_recruiter_points
      WHERE id = p_restaurant_referrer_id;
    
    GET DIAGNOSTICS v_restaurant_recruiter_update_count = ROW_COUNT;
  ELSE
    v_restaurant_recruiter_update_count := 0;
  END IF;

  -- Update app referrer points if applicable (only if different from customer)
  IF p_app_referrer_id IS NOT NULL AND p_app_referrer_id != p_customer_id THEN
    UPDATE profiles
      SET current_points = current_points + p_app_referrer_points
      WHERE id = p_app_referrer_id;
    
    GET DIAGNOSTICS v_app_referrer_update_count = ROW_COUNT;
  ELSE
    -- If app referrer is same as customer, add app referrer points to customer
    IF p_app_referrer_id IS NOT NULL AND p_app_referrer_id = p_customer_id THEN
      UPDATE profiles
        SET current_points = current_points + p_app_referrer_points
        WHERE id = p_customer_id;
      
      GET DIAGNOSTICS v_app_referrer_update_count = ROW_COUNT;
    ELSE
      v_app_referrer_update_count := 0;
    END IF;
  END IF;

  -- Update restaurant points
  UPDATE restaurants
    SET current_points = p_new_restaurant_points
    WHERE id = p_restaurant_id;

  -- Return success response with debug info
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Bill processed successfully',
    'debug', jsonb_build_object(
      'customer_updates', v_customer_update_count,
      'referrer_updates', v_referrer_update_count,
      'app_referrer_updates', v_app_referrer_update_count,
      'restaurant_recruiter_updates', v_restaurant_recruiter_update_count,
      'user_referrer_id', p_user_referrer_id,
      'customer_id', p_customer_id,
      'app_referrer_id', p_app_referrer_id
    )
  );
END;
$$;