
import { useInfiniteQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Activity, UserProfile } from "@/integrations/supabase/types/activity.types";
import { ActivityType } from "@/integrations/supabase/types/enums.types";
import { useToast } from "@/hooks/use-toast";

const ACTIVITIES_PER_PAGE = 20;

interface ActivityPage {
  activities: Activity[];
  nextPage: number | undefined;
}

export const useRestaurantActivity = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const mapActivityType = (type: string | null): ActivityType => {
    switch (type) {
      case 'referral_presented':
        return ActivityType.REFERRAL_PRESENTED;
      case 'referral_scanned':
        return ActivityType.REFERRAL_SCANNED;
      case 'referral_processed':
        return ActivityType.REFERRAL_PROCESSED;
      case 'redeem_presented':
        return ActivityType.REDEEM_PRESENTED;
      case 'redeem_scanned':
        return ActivityType.REDEEM_SCANNED;
      case 'redeem_processed':
        return ActivityType.REDEEM_PROCESSED;
      case 'points_deducted':
        return ActivityType.POINTS_DEDUCTED;
      default:
        return ActivityType.REFERRAL_PRESENTED;
    }
  };

  const mapDbActivityType = (type: string | null): Activity['activity_type'] => {
    switch (type) {
      case 'roll_token_processed':
        return 'roll_token_processed';
      case 'meal_purchase':
        return 'meal_purchase';
      case 'referral_used':
        return 'referral_used';
      case 'restaurant_recruited':
        return 'restaurant_recruited';
      case 'app_referral_used':
        return 'app_referral_used';
      case 'roll_token_generated':
        return 'roll_token_generated';
      default:
        return 'meal_purchase';
    }
  };

  const { 
    data, 
    isLoading, 
    error, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useInfiniteQuery<ActivityPage>({
    queryKey: ['server-activities'],
    queryFn: async ({ pageParam }) => {
      const page = typeof pageParam === 'number' ? pageParam : 0;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data: restaurants } = await supabase
        .from('restaurants')
        .select('id')
        .eq('manager_id', user.id);

      if (!restaurants || restaurants.length === 0) {
        console.error('No restaurant found');
        toast({
          title: "No Restaurant Found",
          description: "Please ensure you have a restaurant assigned to your account.",
          variant: "destructive",
        });
        navigate('/restaurant-manager');
        return { activities: [], nextPage: undefined };
      }

      const restaurant = restaurants[0];
      console.log('Fetching activities for restaurant:', restaurant.id);

      // Calculate pagination range with type-safe arithmetic
      const from = page * ACTIVITIES_PER_PAGE;
      const to = from + ACTIVITIES_PER_PAGE - 1;

      const { data: activities, error: activitiesError } = await supabase
        .from('activities')
        .select(`
          *,
          user:profiles!activities_user_id_fkey (
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
          user_referrer:profiles!activities_user_referrer_id_fkey (
            id,
            first_name,
            last_name,
            name,
            photo
          )
        `)
        .eq('restaurant_id', restaurant.id)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (activitiesError) {
        console.error('Activities error:', activitiesError);
        throw activitiesError;
      }

      const transformedActivities = activities?.map(activity => ({
        ...activity,
        type: mapActivityType(activity.type),
        activity_type: mapDbActivityType(activity.activity_type),
        amount_spent: activity.amount_spent ? Number(activity.amount_spent) : null,
        customer_points: activity.customer_points ? Number(activity.customer_points) : null,
        referrer_points: activity.referrer_points ? Number(activity.referrer_points) : null,
        restaurant_recruiter_points: activity.restaurant_recruiter_points ? Number(activity.restaurant_recruiter_points) : null,
        app_referrer_points: activity.app_referrer_points ? Number(activity.app_referrer_points) : null,
        restaurant_deduction: activity.restaurant_deduction ? Number(activity.restaurant_deduction) : null,
        points_redeemed: activity.points_redeemed ? Number(activity.points_redeemed) : 0,
        initial_points_balance: activity.initial_points_balance ? Number(activity.initial_points_balance) : null,
        user_referrer_id: activity.user_referrer
      } as unknown as Activity)) || [];

      return {
        activities: transformedActivities,
        nextPage: activities?.length === ACTIVITIES_PER_PAGE ? page + 1 : undefined
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    staleTime: 300000, // Cache data for 5 minutes
    gcTime: 3600000, // Keep unused data in cache for 1 hour
    refetchOnWindowFocus: false // Don't refetch when window regains focus
  });

  const allActivities = data?.pages.flatMap(page => page.activities) || [];

  return { 
    activities: allActivities, 
    isLoading, 
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  };
};
