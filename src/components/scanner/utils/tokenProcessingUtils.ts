
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TokenState } from "@/utils/billing/types/billingTypes";

export interface TokenProcessingResult {
  success: boolean;
  role?: string;
  message?: string;
  scanType?: "activity" | "roll_token";
  tokenId?: string;
}

/**
 * Process a roll token when scanned by a customer
 */
export const processCustomerTokenScan = async (
  tokenId: string, 
  userId: string
): Promise<TokenProcessingResult> => {
  console.log('Processing customer token scan:', tokenId);
  
  // Check if token is valid and in correct state
  const { data: token, error: fetchError } = await supabase
    .from('dice_tokens')
    .select('id, token_state, restaurant_id, expires_at')
    .eq('id', tokenId)
    .eq('is_active', true)
    .maybeSingle();
    
  if (fetchError || !token) {
    console.error('Token fetch error:', fetchError);
    toast.error('Invalid or expired token');
    return { 
      success: false, 
      message: "Invalid or expired token" 
    };
  }
  
  console.log('Found token with state:', token.token_state);
  
  // Check if token has expired
  if (token.expires_at && new Date(token.expires_at) < new Date()) {
    console.error('Token has expired');
    toast.error('This token has expired and can no longer be used');
    return { 
      success: false, 
      message: "This token has expired and can no longer be used" 
    };
  }
  
  // Check if token is in correct state for customer scanning
  if (token.token_state !== 'created') {
    console.error('Token already scanned by a user, current state:', token.token_state);
    toast.error('This token has already been scanned by a user');
    return { 
      success: false, 
      message: "This token has already been scanned by a user" 
    };
  }
  
  // Update token to USER_SCANNED state
  console.log('Updating token to user_scanned state');
  const { error: updateError } = await supabase
    .from('dice_tokens')
    .update({
      user_scanned_at: new Date().toISOString(),
      user_scanned_by: userId,
      token_state: 'user_scanned'  // Use exact string value to match database
    })
    .eq('id', tokenId)
    .eq('is_active', true)
    .eq('token_state', 'created');  // Use exact string value to match database
    
  if (updateError) {
    console.error('Error updating token:', updateError);
    toast.error('Failed to process token');
    return { 
      success: false, 
      message: "Failed to process token" 
    };
  }
  
  console.log('Token successfully updated to user_scanned state');
  toast.success("Roll token scanned successfully! Present it at the restaurant within 4 days to roll for a free meal.");
  
  console.log('Token processing completed successfully');
  return { 
    success: true, 
    role: 'customer',
    message: "Roll token scanned successfully",
    scanType: "roll_token",
    tokenId: token.id
  };
};

/**
 * Process a roll token when scanned by restaurant staff
 */
export const processRestaurantTokenScan = async (
  tokenId: string, 
  userId: string
): Promise<TokenProcessingResult> => {
  console.log('Processing restaurant token scan:', tokenId);
  
  // Check if token is valid and in correct state
  const { data: token, error: fetchError } = await supabase
    .from('dice_tokens')
    .select('id, token_state, restaurant_id, user_scanned_by, expires_at')
    .eq('id', tokenId)
    .eq('is_active', true)
    .maybeSingle();
    
  if (fetchError || !token) {
    console.error('Token fetch error:', fetchError);
    toast.error('Invalid or expired token');
    return { 
      success: false, 
      message: "Invalid or expired token" 
    };
  }
  
  console.log('Found token with state:', token.token_state);
  
  // Check if token has expired
  if (token.expires_at && new Date(token.expires_at) < new Date()) {
    console.error('Token has expired');
    toast.error('This token has expired and can no longer be used');
    return { 
      success: false, 
      message: "This token has expired and can no longer be used" 
    };
  }
  
  // Check token state for restaurant scanning
  if (token.token_state === 'created') {
    console.error('Token not scanned by a customer yet');
    toast.error("This token needs to be scanned by a customer first");
    return { success: false, message: "This token needs to be scanned by a customer first" };
  } else if (token.token_state === 'processed') {
    console.error('Token already processed');
    toast.error("This token has already been processed and can't be used again");
    return { success: false, message: "This token has already been processed and can't be used again" };
  }
  
  if (token.token_state === 'present_at_restaurant') {
    // Already in the correct state - improved message
    console.log('Token already in present_at_restaurant state');
    toast.success("Token validated! Customer is already eligible to roll for a free meal");
    return { 
      success: true, 
      role: 'staff',
      message: "Token validated! Customer is already eligible to roll for a free meal",
      scanType: "roll_token",
      tokenId: token.id
    };
  }
  
  // If we're here, token state should be user_scanned, update to present_at_restaurant
  if (token.token_state !== 'user_scanned') {
    console.error('Token in unexpected state:', token.token_state);
    toast.error("Token is in an invalid state");
    return { success: false, message: "Token is in an invalid state" };
  }
  
  // Update token to PRESENT_AT_RESTAURANT state
  console.log('Updating token to present_at_restaurant state');
  const { error: updateError } = await supabase
    .from('dice_tokens')
    .update({
      restaurant_scanned_at: new Date().toISOString(),
      restaurant_scanned_by: userId,
      token_state: 'present_at_restaurant'  // Use exact string value to match database
    })
    .eq('id', tokenId)
    .eq('is_active', true)
    .eq('token_state', 'user_scanned');  // Use exact string value to match database
    
  if (updateError) {
    console.error('Error updating token:', updateError);
    toast.error('Failed to process token');
    return { 
      success: false, 
      message: "Failed to process token" 
    };
  }
  
  console.log('Token successfully updated to present_at_restaurant state');
  toast.success("Token validated! Customer is now eligible to roll for a free meal");
  
  console.log('Token processing completed successfully');
  return { 
    success: true, 
    role: 'staff',
    message: "Token validated! Customer is now eligible to roll for a free meal",
    scanType: "roll_token",
    tokenId: token.id
  };
};
