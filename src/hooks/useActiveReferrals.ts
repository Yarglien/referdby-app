
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Activity } from "@/integrations/supabase/types/activity.types";
import { ActivityType } from "@/integrations/supabase/types/enums.types";

export const useActiveReferrals = (restaurantId: string | undefined) => {
  return useQuery({
    queryKey: ['active-referrals', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return [];

      console.log('Fetching activities for restaurant:', restaurantId);

      const { data, error } = await supabase
        .from('activities')
        .select(`
          id,
          type,
          created_at,
          is_active,
          description,
          user_id,
          restaurant_id,
          amount_spent,
          receipt_photo,
          processed_by_id,
          scanned_at,
          scanner_id,
          points_redeemed,
          expires_at,
          processed_outside_hours,
          initial_points_balance,
          referral_id,
          activity_type,
          customer_points,
          referrer_points,
          restaurant_recruiter_points,
          app_referrer_points,
          restaurant_deduction,
          related_user_id,
          restaurant_referrer_id,
          app_referrer_id,
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
          )
        `)
        .eq('restaurant_id', restaurantId)
        .eq('type', 'referral_scanned')
        .eq('is_active', true)
        .is('processed_by_id', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching activities:', error);
        throw error;
      }

      console.log('Active referrals data:', data);

      return (data?.map(item => ({
        ...item,
        type: item.type as ActivityType,
        activity_type: item.activity_type || null,
        amount_spent: item.amount_spent ? Number(item.amount_spent) : null,
        customer_points: item.customer_points ? Number(item.customer_points) : null,
        referrer_points: item.referrer_points ? Number(item.referrer_points) : null,
        restaurant_recruiter_points: item.restaurant_recruiter_points ? Number(item.restaurant_recruiter_points) : null,
        app_referrer_points: item.app_referrer_points ? Number(item.app_referrer_points) : null,
        restaurant_deduction: item.restaurant_deduction ? Number(item.restaurant_deduction) : null,
        points_redeemed: item.points_redeemed ? Number(item.points_redeemed) : 0,
        initial_points_balance: item.initial_points_balance ? Number(item.initial_points_balance) : null,
        user_referrer_id: item.user_referrer || null,
        description: item.description || '',
        expires_at: item.expires_at || null,
        processed_outside_hours: item.processed_outside_hours || false,
        receipt_photo: item.receipt_photo || null,
        related_user_id: item.related_user_id || null,
        restaurant_referrer_id: item.restaurant_referrer_id || null,
        app_referrer_id: item.app_referrer_id || null,
        referral_id: item.referral_id || null,
        user: item.user || null,
        processed_by: item.processed_by || null
      })) || []) as Activity[];
    },
    enabled: !!restaurantId,
    refetchInterval: 500, // Refresh every 0.5 seconds to see updates faster
    staleTime: 100, // Consider data stale after 0.1 seconds
    gcTime: 3600000,
    refetchOnWindowFocus: true
  });
};
