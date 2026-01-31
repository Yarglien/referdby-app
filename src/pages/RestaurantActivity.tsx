
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { groupActivitiesByDate } from "@/utils/activityUtils";
import { useRestaurantActivity } from "@/hooks/useRestaurantActivity";
import { ActivityGroup } from "@/components/restaurant/activity/ActivityGroup";
import { Activity } from "@/integrations/supabase/types/activity.types";
import { RestaurantNav } from "@/components/RestaurantNav";
import { ActivityType } from "@/integrations/supabase/types/enums.types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from 'react-i18next';

const RestaurantActivity = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { activities, isLoading } = useRestaurantActivity();

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
  });

  useEffect(() => {
    if (!profile && profile !== undefined) {
      navigate('/auth');
    } else if (profile?.role !== 'manager') {
      navigate('/');
    }
  }, [profile, navigate]);

  if (profile === undefined || isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">{t('common.loading')}</div>;
  }

  if (!profile || profile.role !== 'manager') {
    return null;
  }

  // Function to determine activity title
  const getActivityTitle = (activity: Activity): string => {
    // For roll token activities
    if (activity.activity_type === 'roll_token_processed') {
      return t('restaurant.activity.rollForMeal');
    }
    
    // For redemptions
    if (activity.type === ActivityType.REDEEM_PROCESSED || activity.points_redeemed > 0) {
      return t('restaurant.activity.pointsRedemption');
    }
    
    // For referrals
    if (activity.user_referrer_id) {
      return t('restaurant.activity.referralMeal');
    }
    
    return activity.description || t('restaurant.activity.activity');
  };

  // Function to determine points value and sign
  const getPointsValue = (activity: Activity): { value: number; isPositive: boolean } => {
    // For redemptions - show as positive (green) values
    if (activity.type === ActivityType.REDEEM_PROCESSED || activity.points_redeemed > 0) {
      return { 
        value: Math.abs(activity.points_redeemed || 0), 
        isPositive: true
      };
    }
    
    // For meal purchases or referrals - show as negative (red) values
    if (activity.user_referrer_id || 
        activity.type === ActivityType.REFERRAL_PROCESSED || 
        activity.activity_type === 'roll_token_processed') {
      
      // Calculate total points
      const totalPoints = (
        (activity.customer_points || 0) +
        (activity.referrer_points || 0) +
        (activity.restaurant_recruiter_points || 0) +
        (activity.app_referrer_points || 0)
      );
      
      return {
        value: Math.abs(totalPoints),
        isPositive: false // Always negative (red) for purchased meals
      };
    }
    
    // Default fallback
    return { value: 0, isPositive: true };
  };

  const groupedActivities = groupActivitiesByDate(activities);

  return (
    <div className="min-h-screen pb-20 bg-background pt-safe-top">
      <header className="p-4 border-b flex items-center gap-4">
        <Link to="/restaurant-manager">
          <ArrowLeft className="w-6 h-6 text-muted-foreground" />
        </Link>
        <h1 className="text-2xl font-bold">{t('activity.restaurantActivity')}</h1>
      </header>

      <main className="p-4 space-y-6">
        {Object.keys(groupedActivities).length > 0 ? (
          Object.entries(groupedActivities).map(([date, dateActivities]) => (
            <ActivityGroup
              key={date}
              date={date}
              activities={dateActivities}
              getActivityTitle={getActivityTitle}
              getPointsValue={getPointsValue}
            />
          ))
        ) : (
          <div className="text-center text-muted-foreground py-8">
            {t('restaurant.activity.noActivity')}
          </div>
        )}
      </main>

      <RestaurantNav />
    </div>
  );
};

export default RestaurantActivity;
