
import { Activity } from "@/integrations/supabase/types/activity.types";
import { ReferralSection } from "./ReferralSection";
import { ReferralQRHandler } from "./ReferralQRHandler";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface ReferralsListProps {
  referrals: any[];
  onUseReferral: (referral: Activity) => void;
  variant?: "active" | "used";
  activityId?: string | null;
}

export const ReferralsList = ({ 
  referrals, 
  onUseReferral,
  variant = "active",
  activityId = null
}: ReferralsListProps) => {
  const { t } = useTranslation();
  console.log('\n=== Referrals List State ===', {
    totalReferrals: referrals.length,
    variant,
    referralStatuses: referrals.map(r => ({ id: r.id, status: r.status }))
  });

  // Show scanned referrals as actionable
  const activeReferrals = referrals.filter(r => r.status === 'scanned');
  
  // Show presented (restaurant scanned) referrals separately
  const presentedReferrals = referrals.filter(r => r.status === 'presented');
  const usedReferrals = referrals.filter(r => r.status === 'used');

  console.log('Filtered referrals:', {
    active: activeReferrals.length,
    presented: presentedReferrals.length,
    used: usedReferrals.length
  });

  const handleUseReferral = (referral: Activity) => {
    console.log('Using referral:', referral);
    onUseReferral(referral);
  };

  if (referrals.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        {variant === "active" 
          ? t('referrals.noActiveReferrals')
          : t('referrals.noUsedReferrals')
        }
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {variant === "active" && activeReferrals.length > 0 && (
        <ReferralSection
          title={t('referrals.activeReferrals')}
          referrals={activeReferrals}
          onUseReferral={handleUseReferral}
          buttonText="Use Referral"
          variant="active"
          activityId={activityId}
        />
      )}

      {/* Always show presented referrals section when they exist */}
      {presentedReferrals.length > 0 && (
        <ReferralSection
          title={t('referrals.pendingReferrals')}
          referrals={presentedReferrals}
          onUseReferral={handleUseReferral}
          buttonText="View Details"
          variant="presented"
          titleClassName="text-muted-foreground"
          activityId={activityId}
        />
      )}

      {variant === "used" && usedReferrals.length > 0 && (
        <ReferralSection
          title={t('referrals.usedReferrals')}
          referrals={usedReferrals}
          onUseReferral={handleUseReferral}
          buttonText="View Details"
          variant="used"
          titleClassName="text-muted-foreground"
          activityId={activityId}
        />
      )}
    </div>
  );
};
