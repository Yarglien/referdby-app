
import { supabase } from "@/integrations/supabase/client";
import { PointsDistributionEntry } from "@/integrations/supabase/types/activity.types";
import { CreatePointsMapParams } from "@/utils/billing/types/billingTypes";

export const createPointsDistributionMap = async ({
  customerId,
  userReferrerId,
  appReferrerId,
  restaurantReferrerId,
  referralActivity,
  pointsData
}: CreatePointsMapParams) => {
  // Initialize points distribution map
  const pointsMap = new Map<string, PointsDistributionEntry>();
  
  // Add customer points
  const initialCustomerPoints = Number(referralActivity.user.current_points) || 0;
  pointsMap.set(customerId, {
    user_id: customerId,
    roles: ['customer'],
    points: pointsData.customerPoints,
    initial_balance: initialCustomerPoints
  });

  // Handle visit referrer points
  if (userReferrerId && userReferrerId !== 'None') {
    const { data: referrerData } = await supabase
      .from('profiles')
      .select('current_points, first_name, last_name')
      .eq('id', userReferrerId)
      .single();

    if (referrerData) {
      const existingEntry = pointsMap.get(userReferrerId);
      if (existingEntry) {
        existingEntry.roles.push('referrer');
        existingEntry.points += pointsData.referrerPoints;
      } else {
        pointsMap.set(userReferrerId, {
          user_id: userReferrerId,
          roles: ['referrer'],
          points: pointsData.referrerPoints,
          initial_balance: Number(referrerData?.current_points) || 0
        });
      }
    }
  }

  // Handle restaurant recruiter points
  if (restaurantReferrerId && restaurantReferrerId !== 'None') {
    const { data: recruiterData } = await supabase
      .from('profiles')
      .select('current_points, first_name, last_name')
      .eq('id', restaurantReferrerId)
      .single();

    if (recruiterData) {
      const existingEntry = pointsMap.get(restaurantReferrerId);
      if (existingEntry) {
        existingEntry.roles.push('restaurant_recruiter');
        existingEntry.points += pointsData.restaurantRecruiterPoints;
      } else {
        pointsMap.set(restaurantReferrerId, {
          user_id: restaurantReferrerId,
          roles: ['restaurant_recruiter'],
          points: pointsData.restaurantRecruiterPoints,
          initial_balance: Number(recruiterData?.current_points) || 0
        });
      }
    }
  }

  // Handle app referrer points
  if (appReferrerId && appReferrerId !== 'None') {
    const { data: appReferrerData } = await supabase
      .from('profiles')
      .select('current_points, first_name, last_name')
      .eq('id', appReferrerId)
      .single();

    if (appReferrerData) {
      const existingEntry = pointsMap.get(appReferrerId);
      if (existingEntry) {
        existingEntry.roles.push('app_referrer');
        // Add app referrer points to existing points for this user
        existingEntry.points += pointsData.appReferrerPoints;
        console.log(`Added ${pointsData.appReferrerPoints} app referrer points to user ${appReferrerId}. Total now: ${existingEntry.points}`);
      } else {
        pointsMap.set(appReferrerId, {
          user_id: appReferrerId,
          roles: ['app_referrer'],
          points: pointsData.appReferrerPoints,
          initial_balance: Number(appReferrerData?.current_points) || 0
        });
        console.log(`Added new entry with ${pointsData.appReferrerPoints} app referrer points for user ${appReferrerId}`);
      }
    }
  }

  return pointsMap;
};
