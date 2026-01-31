
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useBillActivity = (referralId: string | undefined) => {
  return useQuery({
    queryKey: ['activity', referralId],
    queryFn: async () => {
      if (!referralId) throw new Error('No activity ID provided');

      const { data: activity, error } = await supabase
        .from('activities')
        .select(`
          *,
          user:profiles!activities_user_id_fkey (
            id,
            first_name,
            last_name,
            current_points,
            referer_id,
            home_currency
          ),
          scanner:profiles!activities_scanner_id_fkey (
            id,
            first_name,
            last_name
          ),
          restaurant:restaurants (
            id,
            name,
            referer_id,
            currency,
            require_bill_photos
          )
        `)
        .eq('id', referralId)
        .single();

      if (error) {
        console.error('Error fetching activity:', error);
        throw error;
      }
      
      console.log('Fetched activity data:', activity);
      console.log('Restaurant currency from activity:', activity?.restaurant?.currency);
      console.log('Restaurant require_bill_photos:', activity?.restaurant?.require_bill_photos);
      return activity;
    },
    enabled: !!referralId
  });
};
