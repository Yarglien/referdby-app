
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { ActivityHeader } from "@/components/activity/ActivityHeader";
import { ActivityList } from "@/components/activity/ActivityList";
import { useActivityData } from "@/hooks/useActivityData";
import { getActivityTitle, getPointsValues, groupActivitiesByDate } from "@/utils/activityUtils";
import { Button } from "@/components/ui/button";

// Managers get restaurants as array from FK join; normalize to single restaurant
const getManagerRestaurant = (profile: { restaurants?: { id: string; name: string; current_points: number }[] | { id: string; name: string; current_points: number } | null }) => {
  if (!profile?.restaurants) return null;
  return Array.isArray(profile.restaurants) ? profile.restaurants[0] ?? null : profile.restaurants;
};

const Activity = () => {
  const { data: profile, isLoading: profileLoading, isError: profileError } = useQuery({
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

  const managerRestaurant = getManagerRestaurant(profile as any);
  const { 
    data, 
    isLoading: activitiesLoading,
    isError: activitiesError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = useActivityData(profile, managerRestaurant);

  if (profileLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  if (profileError) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <p className="text-destructive text-center">Failed to load profile. Please try again.</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Retry</Button>
        <BottomNav />
      </div>
    );
  }

  if (activitiesLoading && !data) {
    return (
      <div className="pb-20 min-h-screen bg-background">
        <ActivityHeader 
          role={profile?.role}
          currentPoints={profile?.current_points}
          restaurantPoints={managerRestaurant?.current_points}
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

  if (activitiesError) {
    return (
      <div className="pb-20 min-h-screen bg-background pt-safe-top">
        <ActivityHeader
          role={profile?.role}
          currentPoints={profile?.current_points}
          restaurantPoints={managerRestaurant?.current_points}
        />
        <main className="p-4">
          <p className="text-destructive text-center py-8">Failed to load activities. Please try again.</p>
          <div className="flex justify-center">
            <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
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
        restaurantPoints={managerRestaurant?.current_points}
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
