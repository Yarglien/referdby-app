
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { ActivityHeader } from "@/components/activity/ActivityHeader";
import { ActivityList } from "@/components/activity/ActivityList";
import { useActivityData } from "@/hooks/useActivityData";
import { getActivityTitle, getPointsValues, groupActivitiesByDate } from "@/utils/activityUtils";
import { Button } from "@/components/ui/button";

const Activity = () => {
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('profiles')
        .select('*, restaurants!restaurants_manager_id_fkey(id, name, current_points)')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const { 
    data, 
    isLoading: activitiesLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = useActivityData(profile);

  if (profileLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  if (activitiesLoading && !data) {
    return (
      <div className="pb-20 min-h-screen bg-background">
        <ActivityHeader 
          role={profile?.role}
          currentPoints={profile?.current_points}
          restaurantPoints={profile?.restaurants?.current_points}
        />
        <main className="p-4 space-y-6">
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">Loading activities...</p>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  // Combine all pages of activities
  const allActivities = data?.pages.flatMap(page => page.activities) ?? [];
  const groupedActivities = groupActivitiesByDate(allActivities);
  const isRestaurantManager = profile?.role === 'manager';
  const userHomeCurrency = profile?.home_currency || 'USD';

  return (
    <div className="pb-20 min-h-screen bg-background pt-safe-top">
      <ActivityHeader
        role={profile?.role}
        currentPoints={profile?.current_points}
        restaurantPoints={profile?.restaurants?.current_points}
      />
      <main className="p-4 space-y-6">
        <ActivityList
          groupedActivities={groupedActivities}
          getActivityTitle={(activity) => getActivityTitle(activity, isRestaurantManager)}
          getPointsValues={(activity) => getPointsValues(activity, isRestaurantManager)}
          variant="default"
          userHomeCurrency={userHomeCurrency}
        />
        {hasNextPage && (
          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? 'Loading...' : 'Load More Activities'}
            </Button>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
};

export default Activity;
