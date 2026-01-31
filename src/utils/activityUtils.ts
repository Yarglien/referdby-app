import { format } from "date-fns";
import { Activity } from "@/integrations/supabase/types/activity.types";
import { ActivityType as ActivityTypeEnum } from "@/integrations/supabase/types/enums.types";

export const getActivityTitle = (activity: Activity, isRestaurantManager: boolean = false) => {
  const userName = activity.user ? 
    `${activity.user.first_name} ${activity.user.last_name || ''}`.trim() : 
    'Unknown Customer';
  
  const processedBy = activity.processed_by ?
    `${activity.processed_by.first_name} ${activity.processed_by.last_name || ''}`.trim() :
    null;

  // If it's restaurant manager view, format accordingly
  if (isRestaurantManager) {
    // Check for roll token activities first
    if (activity.activity_type && 
        ['roll_token_processed', 'roll_token_generated'].includes(activity.activity_type) ||
        activity.description?.toLowerCase().includes('roll')) {
      return "Roll for a Meal";
    }
    
    // Then check for processed redemptions
    if (activity.type === ActivityTypeEnum.REDEEM_PROCESSED || activity.points_redeemed > 0) {
      return "Points Redemption";
    }
    
    // Then check for referral usage
    if (activity.user_referrer_id) {
      return "Referral Meal";
    }
    
    // If none of the above, don't show the activity
    return "";
  }

  // User view - different display format
  if (activity.activity_type && 
      ['roll_token_processed', 'roll_token_generated'].includes(activity.activity_type) ||
      activity.description?.toLowerCase().includes('roll')) {
    return "Roll for a Meal";
  }

  if (activity.type === ActivityTypeEnum.REDEEM_PROCESSED || activity.points_redeemed > 0) {
    return "Points Redeemed";
  }

  if (activity.activity_type === 'meal_purchase' && activity.user_referrer_id) {
    return "Meal Purchase";
  }

  if (activity.restaurant_recruiter_points > 0) {
    return "Activity at Recruited Restaurant";
  }

  if (activity.app_referrer_points > 0) {
    return "Recruited User Active";
  }

  if (activity.referrer_points > 0) {
    return "Referral Used";
  }

  if (activity.amount_spent) {
    return "Meal Purchase";
  }

  return 'Activity';
};

export const getPointsValues = (activity: Activity, isRestaurantManager: boolean) => {
  const values = [];
  
  if (isRestaurantManager) {
    // For restaurant manager view
    
    // Don't show points for roll token activities
    if (activity.activity_type === 'roll_token_generated' || 
        activity.activity_type === 'roll_token_processed') {
      return [];
    }
    
    // Show points for redemptions as positive
    if (activity.type === ActivityTypeEnum.REDEEM_PROCESSED || activity.points_redeemed > 0) {
      values.push({
        label: "Points Redeemed",
        value: Math.abs(activity.points_redeemed || 0)
      });
    }
    
    // For referral meals, sum all points as negative
    else if (activity.user_referrer_id) {
      const totalPoints = (
        (activity.customer_points || 0) +
        (activity.referrer_points || 0) +
        (activity.restaurant_recruiter_points || 0) +
        (activity.app_referrer_points || 0)
      );
      
      if (totalPoints > 0) {
        values.push({
          label: "Total Points",
          value: -totalPoints
        });
      }
    }
  } else {
    // Handle customer view
    if (activity.type === ActivityTypeEnum.REDEEM_PROCESSED) {
      values.push({
        label: "Points Redeemed",
        value: -Math.abs(activity.points_redeemed || 0)
      });
    } else {
      // Add all relevant point values as separate entries
      if (activity.customer_points) {
        values.push({
          label: "Purchase Points",
          value: activity.customer_points
        });
      }
      if (activity.referrer_points) {
        values.push({
          label: "Referral Points",
          value: activity.referrer_points
        });
      }
      if (activity.restaurant_recruiter_points) {
        values.push({
          label: "Restaurant Points",
          value: activity.restaurant_recruiter_points
        });
      }
      if (activity.app_referrer_points) {
        values.push({
          label: "Recruit Points",
          value: activity.app_referrer_points
        });
      }
    }
  }
  
  return values;
};

export const groupActivitiesByDate = (activities: Activity[] | undefined | null) => {
  if (!activities) return {};
  
  return activities.reduce((groups: Record<string, Activity[]>, activity) => {
    const date = format(new Date(activity.created_at), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {});
};

export const formatPointValue = (value: number): string => {
  const absValue = Math.abs(value);
  return value >= 0 ? `+${absValue}` : `-${absValue}`;
};
