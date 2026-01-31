
import { supabase } from "@/integrations/supabase/client";
import { calculatePoints } from "@/utils/billing/calculators/pointsCalculator";
import { toast } from "sonner";
import { JsonValue } from "@/integrations/supabase/types/activity.types";
import { createPointsDistributionMap } from "@/utils/billing/mappers/pointsDistributionMapper";
import { ProcessBillParams } from "@/utils/billing/types/billingTypes";

export const processBill = async ({
  billTotal,
  billImage,
  activityId,
  restaurantId,
  customerId,
  processedById,
  userReferrerId,
  appReferrerId,
  restaurantReferrerId,
}: ProcessBillParams) => {
  console.log('\n=== Processing Bill ===');
  console.log('Points Recipients:', {
    customer: customerId,
    userReferrer: userReferrerId || 'None',
    restaurantReferrer: restaurantReferrerId || 'None',
    appReferrer: appReferrerId || 'None'
  });

  const { data: referralActivity, error: referralError } = await supabase
    .from('activities')
    .select(`
      *,
      user:profiles!activities_user_id_fkey (
        id,
        referer_id,
        current_points
      ),
      restaurant:restaurants (
        id,
        referer_id,
        current_points
      ),
      referral_id
    `)
    .eq('id', activityId)
    .single();

  if (referralError) throw referralError;
  if (!referralActivity) throw new Error('Original referral activity not found');

  // Update referral status to 'used' if it exists
  if (referralActivity.referral_id) {
    console.log('Updating referral status for ID:', referralActivity.referral_id);
    const { error: referralUpdateError } = await supabase
      .from('referrals')
      .update({ status: 'used' })
      .eq('id', referralActivity.referral_id);

    if (referralUpdateError) {
      console.error('Error updating referral:', referralUpdateError);
      toast.error("Warning: Failed to update referral status");
      return null;
    }
  }

  // Calculate points based on bill total
  const pointsData = await calculatePoints(billTotal);
  console.log('Points Distribution:', pointsData);

  // Create points distribution map for all recipients
  const pointsMap = await createPointsDistributionMap({
    customerId,
    userReferrerId,
    appReferrerId,
    restaurantReferrerId,
    referralActivity,
    pointsData
  });

  // Convert map to array for final distribution
  const pointsDistribution = Array.from(pointsMap.values()) as unknown as JsonValue;
  console.log('Final Points Distribution:', pointsDistribution);

  // Use the restaurant deduction from allocation rules instead of sum of distributed points
  const totalPointsDeduction = pointsData.restaurantDeduction;

  // Update restaurant points
  const currentRestaurantPoints = Number(referralActivity.restaurant?.current_points) || 0;
  const newRestaurantPoints = Math.max(0, currentRestaurantPoints - totalPointsDeduction);

  // Update the original activity with bill processing details
  const { data: result, error: transactionError } = await supabase
    .rpc('process_bill_transaction', {
      p_activity_id: activityId,
      p_app_referrer_id: appReferrerId,
      p_app_referrer_points: pointsData.appReferrerPoints,
      p_bill_image: billImage,
      p_bill_total: billTotal,
      p_customer_id: customerId,
      p_customer_points: pointsData.customerPoints,
      p_initial_points_balance: referralActivity.user.current_points,
      p_new_restaurant_points: newRestaurantPoints,
      p_points_distribution: pointsDistribution,
      p_processed_by_id: processedById,
      p_referrer_points: pointsData.referrerPoints,
      p_restaurant_deduction: totalPointsDeduction,
      p_restaurant_id: restaurantId,
      p_restaurant_recruiter_points: pointsData.restaurantRecruiterPoints,
      p_restaurant_referrer_id: restaurantReferrerId,
      p_user_referrer_id: userReferrerId
    });

  if (transactionError) throw transactionError;
  return result;
};
