
import { useState } from "react";
import { useActivityCreation } from "./hooks/useActivityCreation";
import { ReferralQRDialog } from "./ReferralQRDialog";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ReferralQRHandlerProps {
  referral: any;
  disabled?: boolean;
}

export const ReferralQRHandler = ({ referral, disabled = false }: ReferralQRHandlerProps) => {
  const [activityId, setActivityId] = useState<string | null>(null);
  const { isCreating, createActivity } = useActivityCreation();

  const handleUseReferral = async () => {
    if (isCreating) {
      toast.info('Please wait...');
      return;
    }

    console.log('\n=== Starting Referral Use Process ===');
    const newActivityId = await createActivity(referral);
    
    if (newActivityId) {
      console.log('Activity created:', newActivityId);
      setActivityId(newActivityId);
      toast.success('Please present the QR code to restaurant staff');
    }
  };

  return (
    <>
      <Button 
        onClick={handleUseReferral}
        disabled={disabled || isCreating}
        className="rounded-lg"
        variant={disabled ? "ghost" : "default"}
      >
        {isCreating ? 'Creating...' : 'Use Referral'}
      </Button>

      {activityId && (
        <ReferralQRDialog
          isOpen={true}
          onClose={() => setActivityId(null)}
          referralCode={activityId}
          type="activity"
          title="Present this QR code"
          description="Show this QR code to the restaurant staff to redeem your referral"
        />
      )}
    </>
  );
};
