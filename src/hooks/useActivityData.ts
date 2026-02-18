
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Activity } from "@/integrations/supabase/types/activity.types";
import { ActivityType as ActivityTypeEnum } from "@/integrations/supabase/types/enums.types";

const ACTIVITIES_PER_PAGE = 10;

interface ActivityPage {
  activities: Activity[];
  nextPage: number | undefined;
}

export const useActivityData = (
  profile: any,
  managerRestaurant?: { id: string } | null
) => {
  return useInfiniteQuery<ActivityPage>({
    queryKey: ['activities', profile?.role, managerRestaurant?.id],
    queryFn: async ({ pageParam = 0 }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Calculate the range for pagination
      const from = Number(pageParam) * ACTIVITIES_PER_PAGE;
      const to = from + ACTIVITIES_PER_PAGE - 1;

      // Fetch paginated activities where the user is involved in any capacity
      let query = supabase
        .from('activities')
        .select(`
          *,
          restaurant:restaurants(id, name, referer_id, photos),
          user:profiles!activities_user_id_fkey(id, first_name, last_name, name, photo),
          processed_by:profiles!activities_processed_by_id_fkey(id, first_name, last_name, name, photo),
          scanner:profiles!activities_scanner_id_fkey(id, first_name, last_name, name, photo),
          user_referrer:profiles!activities_user_referrer_id_fkey(id, first_name, last_name, name, photo)
        `)
        .order('created_at', { ascending: false })
        .range(from, to);

      // Apply different filters based on user role (managerRestaurant from normalized profile.restaurants)
      if (profile?.role === 'manager' && managerRestaurant?.id) {
        query = query
          .eq('restaurant_id', managerRestaurant.id)
          .or('restaurant_deduction.gt.0,restaurant_deduction.lt.0');
      } else {
        // Find all activities where the user appears in any role
        query = query.or(
          `user_id.eq.${user.id},` +
          `user_referrer_id.eq.${user.id},` +
          `restaurant_referrer_id.eq.${user.id},` +
          `app_referrer_id.eq.${user.id}`
        );
      }

      const { data, error } = await query;
      if (error) throw error;

      // Transform the data to match our Activity interface
      const transformedData = data?.map(item => ({
        ...item,
        user_referrer_id: item.user_referrer || null
      })) as Activity[];

      const processedActivities = processActivities(transformedData, user.id, profile?.role);

      return {
        activities: processedActivities,
        nextPage: data && data.length === ACTIVITIES_PER_PAGE ? Number(pageParam) + 1 : undefined
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!profile
  });
};

const processActivities = (
  activities: Activity[], 
  userId: string, 
  userRole?: string
): Activity[] => {
  if (userRole === 'manager') {
    return activities;
  }

  // For regular users, split activities into separate entries based on points earned
  const splitActivities: Activity[] = [];
  
  activities.forEach(activity => {
    // Copy base activity without points
    const baseActivity = {
      ...activity,
      customer_points: 0,
      referrer_points: 0,
      restaurant_recruiter_points: 0,
      app_referrer_points: 0
    };

    // Create separate activities for each type of points
    if (activity.customer_points) {
      splitActivities.push({
        ...baseActivity,
        id: `${activity.id}-customer`,
        customer_points: activity.customer_points,
        activity_type: 'meal_purchase'
      });
    }

    if (activity.referrer_points) {
      splitActivities.push({
        ...baseActivity,
        id: `${activity.id}-referrer`,
        referrer_points: activity.referrer_points,
        activity_type: 'referral_used'
      });
    }

    if (activity.restaurant_recruiter_points) {
      splitActivities.push({
        ...baseActivity,
        id: `${activity.id}-recruiter`,
        restaurant_recruiter_points: activity.restaurant_recruiter_points,
        activity_type: 'restaurant_recruited'
      });
    }

    if (activity.app_referrer_points) {
      splitActivities.push({
        ...baseActivity,
        id: `${activity.id}-app-referrer`,
        app_referrer_points: activity.app_referrer_points,
        activity_type: 'app_referral_used'
      });
    }

    // If it's a redemption or special activity, add it as is
    if (
      activity.points_redeemed > 0 ||
      activity.type === ActivityTypeEnum.REDEEM_PROCESSED ||
      activity.activity_type === 'roll_token_processed' ||
      activity.activity_type === 'roll_token_generated'
    ) {
      splitActivities.push(activity);
    }
  });

  return splitActivities.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
};
