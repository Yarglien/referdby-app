
import { supabase } from "@/integrations/supabase/client";

/**
 * Parses a value to a number, safely handling various input types
 */
export const parseNumber = (value: string | number | null | undefined): number => {
  if (value === null || value === undefined || value === "") return 0;
  const parsed = typeof value === 'string' ? parseFloat(value) : Number(value);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Calculates the maximum points that can be redeemed based on bill amount and max percentage
 */
export const calculateMaxRedeemablePoints = (billAmount: number, percentage: number): number => {
  return Math.floor(billAmount * (percentage / 100));
};

/**
 * Validates if the points to redeem are within allowable range
 * Returns a warning message if validation fails, null otherwise
 */
export const validatePointsRedemption = (
  billTotal: string, 
  pointsToRedeem: string, 
  maxRedemptionPercentage: number,
  userPoints: number
): string | null => {
  const billAmount = parseNumber(billTotal);
  const points = parseNumber(pointsToRedeem);
  
  if (billAmount <= 0 || points <= 0) {
    return null;
  }

  const maxRedeemable = calculateMaxRedeemablePoints(billAmount, maxRedemptionPercentage);
  
  if (points > maxRedeemable) {
    return `This exceeds the restaurant's maximum redemption limit of ${maxRedemptionPercentage}%. Maximum redeemable: ${maxRedeemable} points.`;
  } 
  
  if (points > userPoints) {
    return "Cannot redeem more points than available in your balance.";
  }
  
  return null;
};

/**
 * Fetches the maximum redemption percentage from a restaurant
 */
export const fetchMaxRedemptionPercentage = async (restaurantId: string): Promise<number> => {
  if (!restaurantId) return 100;
  
  const { data, error } = await supabase
    .from('restaurants')
    .select('max_redemption_percentage')
    .eq('id', restaurantId)
    .single();
  
  if (error || !data) {
    console.error('Error fetching max redemption percentage:', error);
    return 100; // Default to 100% if there's an error
  }
  
  return data.max_redemption_percentage || 100;
};
