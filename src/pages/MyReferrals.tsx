
import { BottomNav } from "@/components/BottomNav";
import { MyReferralsHeader } from "@/components/referrals/MyReferralsHeader";
import { MyReferralsLoading } from "@/components/referrals/MyReferralsLoading";
import { ReferralsList } from "@/components/referrals/ReferralsList";
import { ReferralDataFetcher } from "@/components/referrals/ReferralDataFetcher";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Activity } from "@/integrations/supabase/types/activity.types";
import { Skeleton } from "@/components/ui/skeleton";
import { useActivityCreation } from "@/components/referrals/hooks/useActivityCreation";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import { useTranslation } from 'react-i18next';

const MyReferrals = () => {
  const navigate = useNavigate();
  const [selectedReferral, setSelectedReferral] = useState<Activity | null>(null);
  const { isCreating, createActivity } = useActivityCreation();
  const [activityId, setActivityId] = useState<string | null>(null);
  const { profile } = useUser();
  const { t } = useTranslation();

  useEffect(() => {
    if (!profile && profile !== undefined) {
      navigate('/auth');
    }
    // Allow managers and servers in personal mode to access customer features
  }, [profile, navigate]);

  if (profile === undefined) {
    return <MyReferralsLoading />;
  }

  if (!profile) {
    return null;
  }

  const handleUseReferral = async (referral: Activity) => {
    console.log('MyReferrals - handleUseReferral called with:', referral);
    
    if (isCreating) {
      toast.info(t('referrals.pleaseWait'));
      return Promise.resolve();
    }

    try {
      // Create activity for the referral
      console.log('Creating activity for referral:', referral);
      const newActivityId = await createActivity(referral);
      
      if (newActivityId) {
        console.log('Activity created successfully:', newActivityId);
        setActivityId(newActivityId);
        setSelectedReferral(referral);
        toast.success(t('referrals.presentQRCode'));
      } else {
        console.error('Failed to create activity');
        toast.error('Failed to create activity');
      }
    } catch (error) {
      console.error('Error creating activity:', error);
      toast.error('Failed to create activity');
    }
    
    return Promise.resolve();
  };

  return (
    <div className="min-h-screen pb-20 bg-background pt-safe-top">
      <div className="p-6">
        <MyReferralsHeader />
        
        <ReferralDataFetcher>
          {({ activeReferrals, usedReferrals, isLoading, error }) => {
            console.log('🎯 MyReferrals render state:', {
              isLoading,
              activeCount: activeReferrals.length,
              usedCount: usedReferrals.length,
              error
            });
            if (isLoading) {
              return (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">{t('referrals.activeReferrals')}</h2>
                    <div className="space-y-4">
                      <Skeleton className="h-24 w-full rounded-lg" />
                      <Skeleton className="h-24 w-full rounded-lg" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold mb-4">{t('referrals.usedReferrals')}</h2>
                    <div className="space-y-4">
                      <Skeleton className="h-24 w-full rounded-lg" />
                      <Skeleton className="h-24 w-full rounded-lg" />
                    </div>
                  </div>
                </div>
              );
            }

            // Show combined empty state if no referrals at all
            if (activeReferrals.length === 0 && usedReferrals.length === 0) {
              return (
                <div className="space-y-8">
                  <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg mb-4">{t('referrals.noActiveReferrals')}</p>
                    <p className="text-muted-foreground mb-4">{t('referrals.whyNotAskLocal')}</p>
                    <p className="text-muted-foreground text-sm">{t('referrals.noUsedReferrals')}</p>
                  </div>
                </div>
              );
            }

            return (
              <>
                {/* Active Referrals Section - only show if there are active referrals */}
                {activeReferrals.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">{t('referrals.activeReferrals')}</h2>
                    <ReferralsList 
                      referrals={activeReferrals} 
                      onUseReferral={handleUseReferral}
                      variant="active"
                      activityId={activityId}
                    />
                  </div>
                )}

                {/* Used Referrals Section - only show if there are used referrals */}
                {usedReferrals.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">{t('referrals.usedReferrals')}</h2>
                    <ReferralsList 
                      referrals={usedReferrals} 
                      onUseReferral={handleUseReferral}
                      variant="used"
                      activityId={activityId}
                    />
                  </div>
                )}

                {/* Show individual empty states when one section has data and the other doesn't */}
                {activeReferrals.length === 0 && usedReferrals.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">{t('referrals.activeReferrals')}</h2>
                    <p className="text-center text-muted-foreground py-8">
                      {t('referrals.noActiveReferrals')} - {t('referrals.askLocalRecommendation')}
                    </p>
                  </div>
                )}

                {usedReferrals.length === 0 && activeReferrals.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">{t('referrals.usedReferrals')}</h2>
                    <p className="text-center text-muted-foreground py-8">
                      {t('referrals.noUsedReferrals')}
                    </p>
                  </div>
                )}
              </>
            );
          }}
        </ReferralDataFetcher>
      </div>
      <BottomNav />
    </div>
  );
};

export default MyReferrals;
