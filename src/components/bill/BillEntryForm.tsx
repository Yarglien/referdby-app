
import { Button } from "@/components/ui/button";
import { BillImageUpload } from "@/components/BillImageUpload";
import { BillInfo } from "@/components/bill/BillInfo";
import { BillTotalInput } from "@/components/redeem/BillTotalInput";
import { useBillSubmission } from "@/hooks/useBillSubmission";
import { getCurrencySymbol } from "@/utils/currencyUtils";

interface BillEntryFormProps {
  currentUser: any;
  activityData: any;
}

export const BillEntryForm = ({ currentUser, activityData }: BillEntryFormProps) => {
  const {
    billTotal,
    setBillTotal,
    billImage,
    setBillImage,
    isSubmitting,
    handleSubmit
  } = useBillSubmission({ currentUser, activityData });

  // Get restaurant currency for display
  const restaurantCurrency = activityData?.restaurant?.currency || 'USD';
  const currencySymbol = getCurrencySymbol(restaurantCurrency);
  
  // Check if photos are required
  const requirePhotos = activityData?.restaurant?.require_bill_photos ?? true;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <BillInfo currentUser={currentUser} activityData={activityData} />
      
      {requirePhotos && (
        <BillImageUpload onImageSelected={(file) => setBillImage(file)} />
      )}

      <div className="space-y-2">
        <label className="text-red-500">
          Enter Bill Total without Service ({restaurantCurrency} {currencySymbol})
        </label>
        <BillTotalInput 
          billTotal={billTotal} 
          onBillTotalChange={setBillTotal} 
        />
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={!billTotal || (requirePhotos && !billImage) || isSubmitting}
      >
        {isSubmitting ? "Processing..." : "Process Bill"}
      </Button>
    </form>
  );
};
