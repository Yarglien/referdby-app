
import { supabase } from "@/integrations/supabase/client";

/**
 * Checks if a user is eligible to redeem points at a restaurant
 * Users can only redeem once every 3 months at the same restaurant
 */
export const checkRedemptionEligibility = async (
  userId: string, 
  restaurantId: string
): Promise<{ eligible: boolean; message?: string; lastRedemption?: string }> => {
  try {
    // Get the user's last redemption at this restaurant
    const { data: lastRedemption, error } = await supabase
      .from('activities')
      .select('created_at')
      .eq('user_id', userId)
      .eq('restaurant_id', restaurantId)
      .eq('type', 'redeem_processed')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error checking redemption eligibility:', error);
      throw new Error('Failed to check redemption eligibility');
    }

    // If no previous redemption, user is eligible
    if (!lastRedemption) {
      return { eligible: true };
    }

    // Check if 3 months have passed since last redemption
    const lastRedemptionDate = new Date(lastRedemption.created_at);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    if (lastRedemptionDate > threeMonthsAgo) {
      const nextEligibleDate = new Date(lastRedemptionDate);
      nextEligibleDate.setMonth(nextEligibleDate.getMonth() + 3);
      
      return {
        eligible: false,
        message: `You can redeem points at this restaurant again after ${nextEligibleDate.toLocaleDateString()}`,
        lastRedemption: lastRedemption.created_at
      };
    }

    return { eligible: true };
  } catch (error) {
    console.error('Redemption eligibility check failed:', error);
    throw error;
  }
};
