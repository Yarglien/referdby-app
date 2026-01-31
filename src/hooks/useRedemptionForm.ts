import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { isWithinRedemptionHours } from "@/utils/redemptionUtils";
import { fetchMaxRedemptionPercentage, validatePointsRedemption } from "@/utils/redemption/validators";
import { processRedemption } from "@/utils/redemption/processor";
import { checkRedemptionEligibility } from "@/utils/redemption/eligibilityChecker";

interface UseRedemptionFormProps {
  activityData: any;
  currentUser: any;
  onSuccess: () => void;
  checkRedemptionHours: () => Promise<boolean>;
}

export const useRedemptionForm = ({
  activityData,
  currentUser,
  onSuccess,
  checkRedemptionHours
}: UseRedemptionFormProps) => {
  // Form state
  const [billTotal, setBillTotal] = useState("");
  const [pointsToRedeem, setPointsToRedeem] = useState("");
  const [billImage, setBillImage] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOutOfHoursDialog, setShowOutOfHoursDialog] = useState(false);
  const [maxRedemptionWarning, setMaxRedemptionWarning] = useState<string | null>(null);
  const [maxRedemptionPercentage, setMaxRedemptionPercentage] = useState(100);
  const [isTakeaway, setIsTakeaway] = useState(false);
  const [eligibilityWarning, setEligibilityWarning] = useState<string | null>(null);
  
  // Check redemption eligibility when component loads
  useEffect(() => {
    if (activityData?.user_id && activityData?.restaurant_id) {
      const checkEligibility = async () => {
        try {
          const eligibilityCheck = await checkRedemptionEligibility(
            activityData.user_id, 
            activityData.restaurant_id
          );
          
          if (!eligibilityCheck.eligible) {
            setEligibilityWarning(eligibilityCheck.message || "Not eligible for redemption");
          } else {
            setEligibilityWarning(null);
          }
        } catch (error) {
          console.error('Error checking eligibility:', error);
        }
      };
      
      checkEligibility();
    }
  }, [activityData?.user_id, activityData?.restaurant_id]);

  // Get max redemption percentage from restaurant
  useEffect(() => {
    if (activityData?.restaurant_id) {
      const getMaxPercentage = async () => {
        const percentage = await fetchMaxRedemptionPercentage(activityData.restaurant_id);
        setMaxRedemptionPercentage(percentage);
      };
      
      getMaxPercentage();
    }
  }, [activityData?.restaurant_id]);

  // Validate points redemption
  useEffect(() => {
    const userPoints = activityData?.user?.current_points || 0;
    const warning = validatePointsRedemption(
      billTotal, 
      pointsToRedeem, 
      maxRedemptionPercentage,
      userPoints
    );
    
    setMaxRedemptionWarning(warning);
  }, [billTotal, pointsToRedeem, maxRedemptionPercentage, activityData?.user?.current_points]);

  // Process redemption with confirmation for out-of-hours
  const handleProcessRedemption = async (isOutOfHours: boolean) => {
    try {
      setIsProcessing(true);

      // Input validation
      if (!billTotal || !pointsToRedeem) {
        throw new Error("Please fill in all required fields");
      }

      // Check if photos are required
      const requirePhotos = activityData?.restaurant?.require_bill_photos ?? true;
      
      if (requirePhotos && !billImage) {
        throw new Error("Please upload bill image");
      }

      // Extract and validate data
      const { parseNumber } = await import("@/utils/redemption/validators");
      const points = Math.floor(parseNumber(pointsToRedeem));
      const userPoints = parseNumber(activityData.user?.current_points);
      const billAmount = parseNumber(billTotal);

      // Process the redemption
      const success = await processRedemption({
        points,
        userPoints,
        billAmount,
        maxRedemptionPercentage,
        billImage,
        activityId: activityData.id,
        restaurantId: activityData.restaurant_id,
        userId: activityData.user_id,
        processedById: currentUser.id,
        isOutOfHours,
        isTakeaway
      });

      if (success) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Redemption process error:', error);
      toast.error(error.message || "Failed to process redemption");
    } finally {
      setIsProcessing(false);
      setShowOutOfHoursDialog(false);
    }
  };

  // Handle form submission and check if within redemption hours
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check eligibility first
    if (eligibilityWarning) {
      toast.error(eligibilityWarning);
      return;
    }
    
    if (!activityData?.restaurant_id) {
      toast.error("Restaurant information not found");
      return;
    }

    try {
      console.log('Checking redemption hours...');
      // Pass isTakeaway to the redemption hours check
      const isWithinHours = await isWithinRedemptionHours(activityData.restaurant_id, isTakeaway);
      
      console.log('Is within hours:', isWithinHours);
      
      if (!isWithinHours) {
        setShowOutOfHoursDialog(true);
        return;
      }
      
      await handleProcessRedemption(false);
    } catch (error: any) {
      console.error('Error checking redemption hours:', error);
      toast.error(error.message || "Failed to check redemption hours");
    }
  };

  return {
    billTotal,
    setBillTotal,
    pointsToRedeem,
    setPointsToRedeem,
    billImage,
    setBillImage,
    isProcessing,
    maxRedemptionPercentage,
    maxRedemptionWarning,
    eligibilityWarning,
    showOutOfHoursDialog,
    setShowOutOfHoursDialog,
    isTakeaway,
    setIsTakeaway,
    handleSubmit,
    processRedemption: handleProcessRedemption
  };
};
