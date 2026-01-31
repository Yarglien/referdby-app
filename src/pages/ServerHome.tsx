
import { DualRoleNavigation } from "@/components/DualRoleNavigation";
import { ViewModeSelector } from "@/components/ViewModeSelector";
import { ServerHeader } from "@/components/server/ServerHeader";
import { ServerActions } from "@/components/server/ServerActions";
import { WelcomeHeader } from "@/components/home/WelcomeHeader";
import { ProfilePoints } from "@/components/home/ProfilePoints";
import { MenuGrid } from "@/components/home/MenuGrid";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useViewMode } from "@/contexts/ViewModeContext";
import { useUser } from "@/contexts/UserContext";

interface RestaurantData {
  id: string;
  name: string;
  photos: string[];
}

const ServerHome = () => {
  const { viewMode } = useViewMode();
  const { profile, isLoading: isProfileLoading } = useUser();

  // Fetch restaurant data separately using the profile's restaurant_id
  const { data: restaurantData, isLoading: isRestaurantLoading } = useQuery({
    queryKey: ['server-restaurant', profile?.restaurant_id],
    enabled: !!profile?.restaurant_id,
    staleTime: 1000 * 60 * 5, // 5 minutes - prevent unnecessary refetches
    queryFn: async () => {
      if (!profile?.restaurant_id) return null;
      
      console.log('ServerHome: Fetching restaurant:', profile.restaurant_id);
      const { data: restaurant, error } = await supabase
        .from('restaurants')
        .select('id, name, photos')
        .eq('id', profile.restaurant_id)
        .single();

      if (error) {
        console.error('ServerHome: Restaurant fetch error:', error);
        throw error;
      }

      console.log('ServerHome: Restaurant fetched:', restaurant?.name);
      return restaurant as RestaurantData;
    },
  });

  const isLoading = isProfileLoading || (profile?.restaurant_id && isRestaurantLoading);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-safe-top">
      <ViewModeSelector />
      
      <div className="p-6 space-y-6 pb-20">
        {viewMode === 'restaurant' ? (
          <>
            <ServerHeader 
              firstName={profile?.first_name}
              lastName={profile?.last_name}
              restaurantPhoto={restaurantData?.photos?.[0]}
              restaurantName={restaurantData?.name}
            />
            <ServerActions />
          </>
        ) : (
          <>
            <WelcomeHeader profile={profile} />
            <ProfilePoints profile={profile} />
            <MenuGrid profile={profile} />
          </>
        )}
      </div>

      <DualRoleNavigation />
    </div>
  );
};

export default ServerHome;
