
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ActivityType } from "@/integrations/supabase/types/enums.types";

export const fetchActivityDetails = async (activityId: string) => {
  console.log('Fetching activity details for:', activityId);
  
  try {
    const { data: activity, error } = await supabase
      .from('activities')
      .select(`
        *,
        user:profiles!activities_user_id_fkey (
          id,
          first_name,
          last_name,
          referer_id
        ),
        restaurant:restaurants (
          id,
          name,
          referer_id
        ),
        referral_id
      `)
      .eq('id', activityId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching activity:', error);
      throw new Error('Failed to fetch activity details');
    }

    if (!activity) {
      console.error('Activity not found with ID:', activityId);
      throw new Error('Invalid QR code');
    }

    console.log('Activity details fetched:', activity);
    return activity;
  } catch (error) {
    console.error('Error in fetchActivityDetails:', error);
    throw error;
  }
};

export const updateActivityStatus = async (
  activityId: string,
  newType: ActivityType,
  scannerId: string,
  activity: any
) => {
  console.log('Updating activity status:', { activityId, newType, scannerId, activity });

  // Format the timestamp as HH:mm:ss
  const scannedTime = format(new Date(), 'HH:mm:ss');

  // Only update necessary fields for scanning
  const updateData = {
    scanner_id: scannerId,
    scanned_at: scannedTime,
    type: newType
  };

  const { data, error: updateError } = await supabase
    .from('activities')
    .update(updateData)
    .eq('id', activityId)
    .select();

  if (updateError) {
    console.error('Error updating activity:', updateError);
    throw new Error("Failed to update activity status");
  }

  if (!data || data.length === 0) {
    console.error('No rows updated for activity');
    return false;
  }

  console.log('Activity updated successfully');
  return true;
};

export const updateReferralStatus = async (referralId: string) => {
  if (!referralId) {
    console.error('No referral ID provided for status update');
    return false;
  }

  console.log('Updating referral status for ID:', referralId);

  // Check if the referral exists first
  const { data: referral, error: checkError } = await supabase
    .from('referrals')
    .select('status, id')
    .eq('id', referralId)
    .maybeSingle();

  if (checkError) {
    console.error('Error checking referral:', checkError);
    return false;
  }

  if (!referral) {
    console.error('Referral not found with ID:', referralId);
    return false;
  }

  // Update the referral status to 'presented'
  // Only update if not already in 'presented' or further state
  if (referral.status === 'active' || referral.status === 'scanned') {
    const { data, error: updateError } = await supabase
      .from('referrals')
      .update({ status: 'presented' })
      .eq('id', referralId)
      .select();

    if (updateError) {
      console.error('Error updating referral:', updateError);
      toast.error("Warning: Failed to update referral status");
      return false;
    }

    if (!data || data.length === 0) {
      console.error('No rows updated for referral');
      return false;
    }

    console.log('Referral status updated to presented successfully');
    return true;
  } else {
    console.log(`Referral already in status: ${referral.status}, no update needed`);
    return true; // Consider this a success since no update was needed
  }
};
