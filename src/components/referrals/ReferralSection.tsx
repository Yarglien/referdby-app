
import { Activity } from "@/integrations/supabase/types/activity.types";
import { ReferralCard } from "./ReferralCard";
import { ReferralQRDialog } from "./ReferralQRDialog";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ReferralSectionProps {
  title: string;
  referrals: any[];
  onUseReferral: (referral: Activity) => void;
  buttonText?: string;
  variant?: "active" | "presented" | "used";
  titleClassName?: string;
  activityId?: string | null;
}

export const ReferralSection = ({
  title,
  referrals,
  onUseReferral,
  buttonText,
  variant = "active",
  titleClassName = "",
  activityId = null
}: ReferralSectionProps) => {
  const [showQRDialog, setShowQRDialog] = useState(false);

  return (
    <div>
      <h3 className={cn("text-lg font-medium mb-3", titleClassName)}>{title}</h3>
      <div className="space-y-3">
        {referrals.map((referral) => (
          <ReferralCard
            key={referral.id}
            referral={referral}
            onUseReferral={onUseReferral}
            buttonText={buttonText}
            variant={variant}
          />
        ))}
      </div>

      {activityId && (
        <ReferralQRDialog
          isOpen={!!activityId}
          onClose={() => setShowQRDialog(false)}
          referralCode={activityId}
          type="activity"
          title="Present this QR code"
          description="Show this QR code to the restaurant staff to redeem your referral"
        />
      )}
    </div>
  );
};
