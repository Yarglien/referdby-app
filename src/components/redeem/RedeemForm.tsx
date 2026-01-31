
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BillImageUpload } from "@/components/BillImageUpload";
import { BillInfo } from "@/components/bill/BillInfo";
import { BillTotalInput } from "./BillTotalInput";
import { PointsInput } from "./PointsInput";
import { RedemptionCalculator } from "./RedemptionCalculator";
import { OutOfHoursDialog } from "./OutOfHoursDialog";
import { TakeawayToggle } from "./TakeawayToggle";
import { useRedemptionForm } from "@/hooks/useRedemptionForm";

interface RedeemFormProps {
  activityData: any;
  currentUser: any;
  onSuccess: () => void;
  checkRedemptionHours: () => Promise<boolean>;
}

export const RedeemForm = ({ 
  activityData, 
  currentUser, 
  onSuccess,
  checkRedemptionHours 
}: RedeemFormProps) => {
  const {
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
    processRedemption
  } = useRedemptionForm({
    activityData,
    currentUser,
    onSuccess,
    checkRedemptionHours
  });

  // Check if photos are required
  const requirePhotos = activityData?.restaurant?.require_bill_photos ?? true;

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <BillInfo currentUser={currentUser} activityData={activityData} />

        {eligibilityWarning && (
          <Alert variant="destructive">
            <AlertDescription>{eligibilityWarning}</AlertDescription>
          </Alert>
        )}

        <TakeawayToggle 
          value={isTakeaway}
          onChange={setIsTakeaway}
        />

        <BillTotalInput 
          billTotal={billTotal} 
          onBillTotalChange={setBillTotal} 
        />

        <PointsInput 
          pointsToRedeem={pointsToRedeem}
          maxRedemptionPercentage={maxRedemptionPercentage}
          maxUserPoints={activityData.user?.current_points || 0}
          onPointsChange={setPointsToRedeem}
          maxRedemptionWarning={maxRedemptionWarning}
        />

        <RedemptionCalculator 
          billTotal={billTotal}
          pointsToRedeem={pointsToRedeem}
          maxRedemptionPercentage={maxRedemptionPercentage}
          maxRedemptionWarning={maxRedemptionWarning}
          userPoints={activityData.user?.current_points || 0}
        />

        {requirePhotos && (
          <BillImageUpload onImageSelected={(file) => setBillImage(file)} />
        )}

        <div className="flex justify-center">
          <Button 
            type="submit" 
            className="px-8" 
            disabled={
              !billTotal || 
              !pointsToRedeem || 
              (requirePhotos && !billImage) || 
              isProcessing || 
              maxRedemptionWarning !== null ||
              eligibilityWarning !== null
            }
          >
            {isProcessing ? "Processing..." : "Process Redemption"}
          </Button>
        </div>
      </form>

      <OutOfHoursDialog 
        open={showOutOfHoursDialog} 
        onOpenChange={setShowOutOfHoursDialog}
        onProceed={() => processRedemption(true)} 
      />
    </>
  );
};
