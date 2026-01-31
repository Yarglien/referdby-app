
import { Info } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { RestaurantSearch } from "@/components/RestaurantSearch";
import { useToast } from "@/hooks/use-toast";
import { RedeemHeader } from "@/components/redeem/RedeemHeader";
import { ProfilePointsDisplay } from "@/components/redeem/ProfilePointsDisplay";
import { RedeemInfoDialog } from "@/components/redeem/RedeemInfoDialog";
import { RedeemQRDialog } from "@/components/redeem/RedeemQRDialog";
import { useTranslation } from 'react-i18next';

export default function RedeemPoints() {
  const navigate = useNavigate();
  const [showQR, setShowQR] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);
  const [activityId, setActivityId] = useState<string | null>(null);
  const [eligibilityWarning, setEligibilityWarning] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useTranslation();

  const { data: roleProfile, isLoading: roleLoading, error: roleError } = useQuery({
    queryKey: ['role-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      return data;
    },
    retry: 3,
    retryDelay: 1000,
  });

  useEffect(() => {
    if (!roleProfile && roleProfile !== undefined) {
      navigate('/auth');
    }
    // Allow managers and servers in personal mode to access customer features
  }, [roleProfile, navigate]);

  const handleInfoOpen = () => setShowInfo(true);
  const handleInfoClose = (open: boolean) => setShowInfo(open);

  const handleEligibilityCheck = (isEligible: boolean, message?: string, restaurant?: any) => {
    if (!isEligible && message && restaurant) {
      setEligibilityWarning(`You redeemed points at ${restaurant.name} recently. ${message}`);
    } else {
      setEligibilityWarning(null);
    }
  };

  const { data: profile, isLoading, error: profileError } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return profile;
    },
    retry: 3,
    retryDelay: 1000,
  });

  const createActivityMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('activities')
        .insert([
          {
            user_id: user.id,
            restaurant_id: selectedRestaurant.id,
            type: 'redeem_presented',
            is_active: true,
            description: `Redemption at ${selectedRestaurant.name}`,
            points_redeemed: 0,
            customer_points: 0,
            referrer_points: 0,
            restaurant_recruiter_points: 0,
            app_referrer_points: 0,
            restaurant_deduction: 0,
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Activity creation error:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: (data) => {
      setActivityId(data.id);
      setShowQR(true);
      toast({
        title: t('redeem.qrCodeGenerated'),
        description: t('redeem.presentToStaff'),
      });
    },
    onError: (error) => {
      console.error('Error creating activity:', error);
      toast({
        title: t('common.error'),
        description: "Failed to create redemption activity. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestaurant) {
      toast({
        title: t('common.error'),
        description: t('redeem.selectRestaurant'),
        variant: "destructive"
      });
      return;
    }
    createActivityMutation.mutate();
  };

  if (roleLoading || isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (roleError || profileError) {
    console.error('Profile error:', roleError || profileError);
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading profile</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!roleProfile) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen pb-16 pt-safe-top">
      <div className="p-6 space-y-8">
        <RedeemHeader />
        <ProfilePointsDisplay profile={profile} />

        <div className="w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">{t('redeem.whichRestaurant')}</h3>
          <div className="space-y-4">
            <RestaurantSearch 
              searchTerm={searchTerm}
              onSearch={(term: string) => {
                setSearchTerm(term);
                // Clear eligibility warning when user starts typing new search
                if (eligibilityWarning) {
                  setEligibilityWarning(null);
                }
              }}
              onSelectRestaurant={(restaurant) => setSelectedRestaurant(restaurant)}
              selectedRestaurant={selectedRestaurant}
              onEligibilityCheck={handleEligibilityCheck}
            />
            
            {/* Display eligibility warning */}
            {eligibilityWarning && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                <p className="text-sm font-medium">{eligibilityWarning}</p>
                <p className="text-sm mt-1">{t('redeem.tryAlternative')}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="flex justify-center">
              <Button 
                type="submit" 
                className="bg-primary text-white px-8"
                disabled={!selectedRestaurant || createActivityMutation.isPending || !!eligibilityWarning}
              >
                {t('redeem.generateQRCode')}
              </Button>
            </form>
          </div>
        </div>

        <div className="w-full max-w-md flex items-center gap-2">
          <h3 className="text-xl text-muted-foreground">{t('redeem.howToRedeem')}</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleInfoOpen}
          >
            <Info className="h-5 w-5 text-primary" />
          </Button>
        </div>
      </div>

      <RedeemInfoDialog open={showInfo} onOpenChange={handleInfoClose} />
      <RedeemQRDialog 
        open={showQR} 
        onOpenChange={(open) => setShowQR(open)} 
        activityId={activityId} 
      />
      <BottomNav />
    </div>
  );
}
