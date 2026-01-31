
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RestaurantNav } from "@/components/RestaurantNav";
import { Activity } from "@/integrations/supabase/types/activity.types";
import { ActivityType } from "@/integrations/supabase/types/enums.types";
import { format } from "date-fns";
import { ReferralGroup } from "@/components/referrals/ReferralGroup";
import { ServerNav } from "@/components/ServerNav";
import { RedeemLoading } from "@/components/redeem/RedeemLoading";
import { useTranslation } from 'react-i18next';

export default function ActiveRedeemers() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  // Profile query with caching
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
    staleTime: 300000, // Cache for 5 minutes
    gcTime: 3600000, // Keep in cache for 1 hour
  });

  // Determine back path based on user role
  const backPath = profile?.role === 'manager' ? "/restaurant-manager" : "/server-home";

  // Optimized activities query with selective field fetching
  const { data: activities, isLoading } = useQuery({
    queryKey: ['active-redeemers', profile?.restaurant_id],
    queryFn: async () => {
      if (!profile?.restaurant_id) return [];
      
      console.log('Fetching redeemer activities for restaurant:', profile.restaurant_id);
      const { data, error: activitiesError } = await supabase
        .from('activities')
        .select(`
          id,
          type,
          created_at,
          is_active,
          points_redeemed,
          description,
          activity_type,
          receipt_photo,
          amount_spent,
          user_id,
          related_user_id,
          restaurant_id,
          restaurant_referrer_id,
          app_referrer_id,
          scanner_id,
          processed_by_id,
          customer_points,
          referrer_points,
          restaurant_recruiter_points,
          app_referrer_points,
          restaurant_deduction,
          expires_at,
          processed_outside_hours,
          initial_points_balance,
          referral_id,
          scanned_at,
          user:profiles!activities_user_id_fkey (
            id,
            first_name,
            last_name,
            name,
            photo
          ),
          user_referrer:profiles!activities_user_referrer_id_fkey (
            id,
            first_name,
            last_name,
            name,
            photo
          ),
          processed_by:profiles!activities_processed_by_id_fkey (
            id,
            first_name,
            last_name,
            name,
            photo
          ),
          scanner:profiles!activities_scanner_id_fkey (
            id,
            first_name,
            last_name,
            name,
            photo
          ),
          restaurant:restaurants (
            id,
            name
          )
        `)
        .eq('type', ActivityType.REDEEM_SCANNED)
        .eq('restaurant_id', profile.restaurant_id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (activitiesError) {
        console.error('Activities error:', activitiesError);
        throw activitiesError;
      }

      return (data?.map(item => ({
        id: item.id,
        type: ActivityType.REDEEM_SCANNED,
        created_at: item.created_at,
        is_active: item.is_active ?? true,
        points_redeemed: item.points_redeemed ? Number(item.points_redeemed) : 0,
        description: item.description || "Points redemption",
        activity_type: item.activity_type || "redeem_scanned",
        receipt_photo: item.receipt_photo,
        amount_spent: item.amount_spent ? Number(item.amount_spent) : null,
        user_id: item.user_id,
        related_user_id: item.related_user_id,
        restaurant_id: item.restaurant?.id || null,
        restaurant_referrer_id: item.restaurant_referrer_id,
        app_referrer_id: item.app_referrer_id,
        scanner_id: item.scanner_id,
        processed_by_id: item.processed_by_id,
        customer_points: item.customer_points ? Number(item.customer_points) : null,
        referrer_points: item.referrer_points ? Number(item.referrer_points) : null,
        restaurant_recruiter_points: item.restaurant_recruiter_points ? Number(item.restaurant_recruiter_points) : null,
        app_referrer_points: item.app_referrer_points ? Number(item.app_referrer_points) : null,
        restaurant_deduction: item.restaurant_deduction ? Number(item.restaurant_deduction) : null,
        expires_at: item.expires_at,
        processed_outside_hours: item.processed_outside_hours ?? false,
        initial_points_balance: item.initial_points_balance ? Number(item.initial_points_balance) : null,
        referral_id: item.referral_id,
        scanned_at: item.scanned_at,
        user: item.user,
        user_referrer_id: item.user_referrer,
        processed_by: item.processed_by,
        scanner: item.scanner,
        restaurant: item.restaurant
      })) || []) as Activity[];
    },
    staleTime: 300000, // Cache for 5 minutes
    gcTime: 3600000, // Keep in cache for 1 hour
    refetchOnWindowFocus: false // Prevent unnecessary refetches
  });

  const handleProcess = (activity: Activity) => {
    navigate(`/redeem-entry/${activity.id}`);
  };

  // Group activities by date
  const groupedActivities = activities?.reduce((groups: Record<string, Activity[]>, activity) => {
    const date = format(new Date(activity.created_at), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {});

  if (isLoading) {
    return <RedeemLoading />;
  }

  return (
    <div className="min-h-screen bg-background pb-20 pt-safe-top">
      <header className="p-4 border-b flex items-center gap-4">
        <Link to={backPath}>
          <ArrowLeft className="w-6 h-6 text-primary hover:text-primary/80 transition-colors" />
        </Link>
        <h1 className="text-2xl font-bold">{t('restaurant.activeRedeemers')}</h1>
      </header>
      <div className="container py-4">
        {!activities?.length ? (
          <div className="text-center py-8 text-muted-foreground">
            {t('restaurant.noActiveRedeemers')}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedActivities || {}).map(([date, dateActivities]) => (
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
        )}
      </div>
      {profile?.role === 'manager' ? <RestaurantNav /> : <ServerNav />}
    </div>
  );
}
