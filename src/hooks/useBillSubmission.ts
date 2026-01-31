
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { processBillWithCurrency } from "@/utils/billing/processors/currencyAwareBillProcessor";
import { uploadBillImage } from "@/utils/fileStorage";

interface UseBillSubmissionProps {
  currentUser: any;
  activityData: any;
}

export const useBillSubmission = ({ currentUser, activityData }: UseBillSubmissionProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [billTotal, setBillTotal] = useState("");
  const [billImage, setBillImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Submit values:', {
      billTotal,
      billImage,
      activityData,
      currentUser
    });
    
    if (!billTotal || parseFloat(billTotal) <= 0) {
      toast.error("Please enter a valid bill total");
      return;
    }

    // Check if photos are required
    const requirePhotos = activityData?.restaurant?.require_bill_photos ?? true;
    
    if (requirePhotos && !billImage) {
      toast.error("Please upload a bill image");
      return;
    }

    if (!activityData || !currentUser) {
      toast.error("Required data is missing. Please try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const amount = parseFloat(billTotal);
      
      // Only upload image if photo is provided (when required or optional)
      let publicUrl = null;
      if (billImage) {
        publicUrl = await uploadBillImage(activityData.restaurant.id, billImage);
      }

      // Get currency information
      const customerHomeCurrency = activityData.user?.home_currency || 'USD';
      
      // For now, we'll assume the bill is in USD unless specified otherwise
      // In a future enhancement, this could be determined by restaurant location or user input
      const billCurrency = 'USD';

      console.log('Processing bill with currencies:', {
        billCurrency,
        customerHomeCurrency,
        amount
      });

      await processBillWithCurrency({
        billTotal: amount,
        billImage: publicUrl,
        activityId: activityData.id,
        restaurantId: activityData.restaurant.id,
        customerId: activityData.user.id,
        processedById: currentUser.id,
        userReferrerId: activityData.user_referrer_id,
        appReferrerId: activityData.user.referer_id,
        restaurantReferrerId: activityData.restaurant.referer_id,
        billCurrency,
        customerHomeCurrency
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['profile'] }),
        queryClient.invalidateQueries({ queryKey: ['activities'] }),
        queryClient.invalidateQueries({ queryKey: ['restaurant'] }),
        queryClient.invalidateQueries({ queryKey: ['referrals'] }),
        queryClient.invalidateQueries({ queryKey: ['active-referrals'] })
      ]);
      
      toast.success("Bill processed successfully with currency conversion");
      navigate("/");
    } catch (error: any) {
      console.error('Error processing bill:', error);
      toast.error(error.message || "Failed to process bill");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    billTotal,
    setBillTotal,
    billImage,
    setBillImage,
    isSubmitting,
    handleSubmit
  };
};
