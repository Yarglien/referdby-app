
import { supabase } from "@/integrations/supabase/client";
import { calculatePoints } from "./pointsCalculator";
import { ActivityType } from "@/integrations/supabase/types/enums.types";
import { Activity, UserProfile } from "@/integrations/supabase/types/activity.types";

export const reprocessActivity = async (activityId: string) => {
  console.log('Reprocessing activity:', activityId);
  
  // First fetch the activity with all related profiles
  const { data: activity, error: fetchError } = await supabase
    .from('activities')
    .select(`
      *,
      user:profiles!activities_user_id_fkey(id),
      user_referrer:profiles!activities_user_referrer_id_fkey(id),
      restaurant_recruiter:profiles!activities_restaurant_referrer_id_fkey(id),
      app_referrer:profiles!activities_app_referrer_id_fkey(id)
    `)
    .eq('id', activityId)
    .single();

  if (fetchError) throw fetchError;
  if (!activity) throw new Error('Activity not found');
  if (!activity.amount_spent) throw new Error('No amount spent found');

  // Calculate points based on amount spent
  const pointsData = await calculatePoints(activity.amount_spent);

  // Update the activity with new points distribution
  const { error: updateError } = await supabase
    .from('activities')
    .update({
      customer_points: pointsData.customerPoints,
      referrer_points: pointsData.referrerPoints,
      restaurant_recruiter_points: pointsData.restaurantRecruiterPoints,
      app_referrer_points: pointsData.appReferrerPoints,
      restaurant_deduction: pointsData.restaurantDeduction,
      type: ActivityType.REFERRAL_PROCESSED
    })
    .eq('id', activityId);

  if (updateError) throw updateError;

  // Update points for all involved users using RPC
  const profiles = {
    user: (activity.user as unknown as { id: string } | null)?.id,
    user_referrer: (activity.user_referrer as unknown as { id: string } | null)?.id,
    restaurant_recruiter: (activity.restaurant_recruiter as unknown as { id: string } | null)?.id,
    app_referrer: (activity.app_referrer as unknown as { id: string } | null)?.id,
  };

  if (profiles.user) {
    const { error: userError } = await supabase.rpc(
      'update_user_points',
      { 
        p_points: pointsData.customerPoints,
        p_user_id: profiles.user
      }
    );
    if (userError) throw userError;
  }

  if (profiles.user_referrer) {
    const { error: referrerError } = await supabase.rpc(
      'update_user_points',
      { 
        p_points: pointsData.referrerPoints,
        p_user_id: profiles.user_referrer
      }
    );
    if (referrerError) throw referrerError;
  }

  if (profiles.restaurant_recruiter) {
    const { error: recruiterError } = await supabase.rpc(
      'update_user_points',
      { 
        p_points: pointsData.restaurantRecruiterPoints,
        p_user_id: profiles.restaurant_recruiter
      }
    );
    if (recruiterError) throw recruiterError;
  }

  if (profiles.app_referrer) {
    const { error: appReferrerError } = await supabase.rpc(
      'update_user_points',
      { 
        p_points: pointsData.appReferrerPoints,
        p_user_id: profiles.app_referrer
      }
    );
    if (appReferrerError) throw appReferrerError;
  }

  console.log('Activity reprocessed successfully:', activityId);
  return activity;
};
