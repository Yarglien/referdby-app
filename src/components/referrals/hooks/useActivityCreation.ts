
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { addDays, format } from "date-fns";
import { toast } from "sonner";
import { ActivityType } from "@/integrations/supabase/types/enums.types";

export const useActivityCreation = () => {
  const [isCreating, setIsCreating] = useState(false);

  const createActivity = async (referral: any) => {
    console.log('\n=== Creating Activity ===');
    console.log('Input referral:', referral);
    
    if (isCreating) {
      console.log('Already creating activity, aborting');
      return null;
    }

    setIsCreating(true);

    try {
      // Step 1: Get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Auth error:', authError);
        toast.error('Authentication required');
        return null;
      }

      // Step 2: Get user's profile to check for referrer
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('referer_id')
        .eq('id', user.id)
        .single();

      // Step 3: Get full referral details including creator info
      const { data: fullReferral, error: referralError } = await supabase
        .from('referrals')
        .select(`
          *,
          creator:creator_id (
            id,
            referer_id
          ),
          restaurant:restaurant_id (
            id,
            name,
            referer_id
          )
        `)
        .eq('id', referral.id)
        .single();

      if (referralError || !fullReferral) {
        console.error('Error fetching referral details:', referralError);
        toast.error('Failed to fetch referral details');
        return null;
      }

      console.log('Full referral data:', fullReferral);
      console.log('Restaurant data:', fullReferral.restaurant);
      console.log('Referral creator:', fullReferral.creator);

      // Format dates in PostgreSQL timestamp format
      const now = new Date();
      const expiresAt = addDays(now, 1);
      const formattedExpiresAt = format(expiresAt, "yyyy-MM-dd'T'HH:mm:ssX");

      // Create activity record with referrer IDs
      const activityData = {
        user_id: user.id,
        restaurant_id: fullReferral.restaurant_id,
        type: ActivityType.REFERRAL_PRESENTED,
        is_active: true,
        expires_at: formattedExpiresAt,
        referral_id: fullReferral.id,
        description: `Referral presented at ${fullReferral.restaurant?.name}`,
        app_referrer_id: userProfile?.referer_id || null,
        restaurant_referrer_id: fullReferral.restaurant?.referer_id || null,
        user_referrer_id: fullReferral.creator_id // The person who created the referral
      };

      console.log('Creating activity with data:', activityData);
      console.log('User referrer (creator_id):', fullReferral.creator_id);

      const { data: activity, error: createError } = await supabase
        .from('activities')
        .insert([activityData])
        .select()
        .single();

      if (createError || !activity) {
        console.error('Activity creation failed:', createError);
        toast.error('Failed to create activity');
        return null;
      }

      console.log('Activity created successfully:', activity);
      return activity.id;

    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred');
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    isCreating,
    createActivity
  };
};
