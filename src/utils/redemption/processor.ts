import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { uploadBillImage } from "@/utils/fileStorage";
import { ActivityType } from "@/integrations/supabase/types/enums.types";
import { parseNumber } from "./validators";
import { checkRedemptionEligibility } from "./eligibilityChecker";

interface ProcessRedemptionParams {
  points: number;
  userPoints: number;
  billAmount: number;
  maxRedemptionPercentage: number;
  billImage: File;
  activityId: string;
  restaurantId: string;
  userId: string;
  processedById: string;
  isOutOfHours: boolean;
  isTakeaway: boolean;
}

/**
 * Processes a points redemption transaction
 */
export const processRedemption = async ({
  points,
  userPoints,
  billAmount,
  maxRedemptionPercentage,
  billImage,
  activityId,
  restaurantId,
  userId,
  processedById,
  isOutOfHours,
  isTakeaway
}: ProcessRedemptionParams): Promise<boolean> => {
  try {
    console.log('Starting redemption process with values:', {
      points,
      userPoints,
      billAmount,
      maxRedemptionPercentage,
      restaurantId,
      userId
    });

    // Check redemption eligibility (3-month rule)
    const eligibilityCheck = await checkRedemptionEligibility(userId, restaurantId);
    if (!eligibilityCheck.eligible) {
      throw new Error(eligibilityCheck.message || "You are not eligible to redeem at this restaurant yet");
    }

    // Basic validation
    if (points <= 0) throw new Error("Points must be greater than zero");
    if (billAmount <= 0) throw new Error("Bill total must be greater than zero");
    if (points > userPoints) throw new Error("Cannot redeem more points than available");

    // Validate against max redemption percentage
    const maxRedeemable = Math.floor(billAmount * (maxRedemptionPercentage / 100));
    if (points > maxRedeemable) {
      throw new Error(
        `Redemption exceeds restaurant's limit of ${maxRedemptionPercentage}%. Maximum: ${maxRedeemable} points.`
      );
    }

    // Upload bill image 
    console.log('Uploading bill image...');
    const billImageUrl = await uploadBillImage(restaurantId, billImage);
    console.log('Bill image uploaded:', billImageUrl);

    // Process points redemption
    console.log('Processing points redemption with values:', {
      p_current_points: userPoints,
      p_points_amount: points,
      p_restaurant_id: restaurantId,
      p_user_id: userId
    });

    const { data: redemptionData, error: pointsError } = await supabase.rpc(
      'process_points_redemption',
      {
        p_current_points: userPoints,
        p_points_amount: points,
        p_restaurant_id: restaurantId,
        p_user_id: userId
      }
    );

    console.log('Points redemption response:', { redemptionData, pointsError });
    if (pointsError) throw pointsError;

    // Update activity record
    console.log('Updating activity record...');
    const { error: updateError } = await supabase
      .from('activities')
      .update({
        amount_spent: billAmount,
        points_redeemed: points,
        processed_by_id: processedById,
        is_active: false,
        initial_points_balance: userPoints,
        type: ActivityType.REDEEM_PROCESSED,
        receipt_photo: billImageUrl,
        processed_outside_hours: isOutOfHours,
        description: isTakeaway ? "Points redeemed (takeaway)" : "Points redeemed"
      })
      .eq('id', activityId);

    if (updateError) throw updateError;

    console.log('Redemption completed successfully');
    toast.success("Redemption processed successfully");
    
    return true;
  } catch (error: any) {
    console.error('Redemption error:', error);
    toast.error(error.message || "Failed to process redemption");
    return false;
  }
};
