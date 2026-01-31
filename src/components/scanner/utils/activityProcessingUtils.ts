
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  fetchActivityDetails, 
  updateActivityStatus, 
  updateReferralStatus
} from "../scanProcessingUtils";
import { ActivityType } from "@/integrations/supabase/types/enums.types";

export interface ActivityProcessingResult {
  success: boolean;
  role?: string;
  message?: string;
  scanType?: "activity" | "roll_token";
}

/**
 * Process an activity scan (e.g., referral)
 */
export const processActivityScan = async (
  activityId: string,
  userId: string
): Promise<ActivityProcessingResult> => {
  console.log('Processing activity scan:', activityId);
  
  // First check if this is a referral ID that can be claimed
  const { data: referralCheck } = await supabase
    .from('referrals')
    .select(`
      id, status, expires_at, creator_id, restaurant_id, external_restaurant_id, is_external,
      restaurant:restaurant_id (name),
      external_restaurant:external_restaurant_id (name)
    `)
    .eq('id', activityId)
    .maybeSingle();
    
  if (referralCheck) {
    console.log('Found referral ID, attempting to claim:', referralCheck);
    
    // Check if referral is expired
    if (referralCheck.expires_at) {
      const now = new Date();
      const expiresAt = new Date(referralCheck.expires_at);
      if (expiresAt < now) {
        toast.error("This referral has expired");
        return { 
          success: false, 
          message: "This referral has expired" 
        };
      }
    }
    
    // Check referral status - only original active referrals should be claimable
    if (referralCheck.status !== 'active') {
      toast.error("This referral is no longer valid");
      return { 
        success: false, 
        message: "This referral is no longer valid" 
      };
    }
    
    // Check if user is trying to scan their own referral
    if (referralCheck.creator_id === userId) {
      toast.error("You cannot claim your own referral");
      return { 
        success: false, 
        message: "You cannot claim your own referral" 
      };
    }
    
    // Check if user has already claimed this specific referral
    const { data: existingClaim } = await supabase
      .from('referrals')
      .select('id')
      .eq('creator_id', referralCheck.creator_id)
      .eq('restaurant_id', referralCheck.restaurant_id)
      .eq('external_restaurant_id', referralCheck.external_restaurant_id)
      .eq('scanned_by_id', userId)
      .maybeSingle();
    
    if (existingClaim) {
      toast.error("You have already claimed this referral");
      return { 
        success: false, 
        message: "You have already claimed this referral" 
      };
    }
    
    // Create a NEW referral record for this user (don't update the original)
    const { error: claimError } = await supabase
      .from('referrals')
      .insert({
        creator_id: referralCheck.creator_id,
        restaurant_id: referralCheck.restaurant_id,
        external_restaurant_id: referralCheck.external_restaurant_id,
        is_external: referralCheck.is_external,
        status: 'scanned',
        scanned_at: new Date().toISOString(),
        scanned_by_id: userId,
        expires_at: referralCheck.expires_at
      });

    if (claimError) {
      console.error('Error creating claimed referral:', claimError);
      toast.error("Failed to claim referral");
      return { 
        success: false, 
        message: "Failed to claim referral" 
      };
    }

    const restaurantName = referralCheck.restaurant?.name || referralCheck.external_restaurant?.name || "restaurant";
    toast.success(`Referral for ${restaurantName} claimed! Check "My Referrals" to use it.`);
    
    return { 
      success: true, 
      message: `Referral claimed successfully`,
      scanType: "activity"
    };
  }

  // Check if this is a valid activity ID
  const { data: activityCheck, error: checkError } = await supabase
    .from('activities')
    .select('id, type')
    .eq('id', activityId)
    .maybeSingle();
    
  // If no activity found, reject the scan
  if (!activityCheck) {
    console.error('No activity found with ID:', activityId);
    toast.error("Invalid QR code - no activity found");
    return { 
      success: false, 
      message: "Invalid QR code - no activity found" 
    };
  }
  
  console.log('Found existing activity:', activityCheck);
  
  // Check if activity has already been processed
  if (activityCheck.type === ActivityType.REFERRAL_SCANNED || activityCheck.type === ActivityType.REFERRAL_PROCESSED) {
    toast.error("Referral already presented");
    return { 
      success: false, 
      message: "Referral already presented" 
    };
  }
  
  // Only allow referral_presented activities to be scanned
  if (activityCheck.type !== ActivityType.REFERRAL_PRESENTED) {
    toast.error("Invalid activity type");
    return { 
      success: false, 
      message: "Invalid activity type" 
    };
  }
    
  // Fetch full activity details
  const activity = await fetchActivityDetails(activityId);
  if (!activity) {
    toast.error("Could not retrieve activity details");
    return { 
      success: false, 
      message: "Could not retrieve activity details" 
    };
  }
    
  // Update the activity status
  const newType = ActivityType.REFERRAL_SCANNED;
  const updateResult = await updateActivityStatus(activityId, newType, userId, activity);
  if (!updateResult) {
    toast.error("Failed to update activity status");
    return { 
      success: false, 
      message: "Failed to update activity status" 
    };
  }

  // Update the referral status if this activity is tied to a referral
  if (activity.referral_id) {
    const referralUpdateResult = await updateReferralStatus(activity.referral_id);
    if (!referralUpdateResult) {
      console.warn('Failed to update referral status, but continuing');
    }
  }
    
  toast.success("Referral has been successfully scanned");
  
  console.log('Activity scan processing completed successfully');
  return { 
    success: true, 
    message: "Referral has been successfully scanned",
    scanType: "activity"
  };
};
