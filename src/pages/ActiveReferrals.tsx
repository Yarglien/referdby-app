
import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { RestaurantNav } from "@/components/RestaurantNav";
import { ServerNav } from "@/components/ServerNav";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReferralGroup } from "@/components/referrals/ReferralGroup";
import { format } from "date-fns";
import { Activity } from "@/integrations/supabase/types/activity.types";
import { ActiveReferralsHeader } from "@/components/active-referrals/ActiveReferralsHeader";
import { RestaurantHeader } from "@/components/active-referrals/RestaurantHeader";
import { useActiveReferrals } from "@/hooks/useActiveReferrals";
import { useTranslation } from 'react-i18next';

const ActiveReferrals = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
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
    staleTime: 300000,
    gcTime: 3600000,
  });

  const backPath = profile?.role === 'manager' ? "/restaurant-manager" : "/server-home";

  const { data: restaurantData } = useQuery({
    queryKey: ['manager-restaurant'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data: restaurant, error } = await supabase
        .from('restaurants')
        .select('id, name, photos')
        .eq('manager_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return restaurant;
    },
    staleTime: 300000,
    gcTime: 3600000,
  });

  const { data: activities = [], isLoading } = useActiveReferrals(restaurantData?.id);

  const handleProcess = async (activity: Activity) => {
    navigate('/bill-entry', { state: { referral: activity } });
  };

  const groupedActivities = activities.reduce((groups: Record<string, Activity[]>, activity) => {
    const dateString = activity.created_at;
    
    try {
      const date = format(new Date(dateString), 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(activity);
    } catch (error) {
      console.warn('Invalid date found for activity:', activity.id, dateString);
    }
    return groups;
  }, {});

  return (
    <div className="min-h-screen pb-20 bg-background pt-safe-top">
      <ActiveReferralsHeader backPath={backPath} />

      <main className="p-4">
        <Card className="overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <RestaurantHeader
                name={restaurantData?.name}
                photo={restaurantData?.photos?.[0]}
              />

              {Object.keys(groupedActivities).length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(groupedActivities).map(([date, dateActivities]) => (
                    <ReferralGroup
                      key={date}
                      date={date}
                      activities={dateActivities}
                      onUseReferral={handleProcess}
                      buttonText="Process"
                      variant="active"
                    />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  {t('restaurant.noActiveScannedReferrals')}
                </div>
              )}
            </>
          )}
        </Card>
      </main>

      {profile?.role === 'manager' ? <RestaurantNav /> : <ServerNav />}
    </div>
  );
};

export default ActiveReferrals;
