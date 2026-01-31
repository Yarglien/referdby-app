
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { RestaurantNav } from "@/components/RestaurantNav";
import { ActiveRollersHeader } from "@/components/active-rollers/ActiveRollersHeader";
import { ActiveRollersList } from "@/components/active-rollers/ActiveRollersList";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ActiveRollers = () => {
  const location = useLocation();
  const recentlyScannedToken = location.state?.recentlyScanned;
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Effect to handle recently scanned token highlighting
  useEffect(() => {
    if (recentlyScannedToken) {
      console.log('Recent token scanned:', recentlyScannedToken);
    }
  }, [recentlyScannedToken]);

  // Effect to check restaurant association
  useEffect(() => {
    const checkRestaurantAssociation = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.error('No authenticated user found');
          setError('Authentication required');
          setLoading(false);
          return;
        }

        console.log('Checking restaurant association for user:', user.id);

        // First try to get directly from profile.restaurant_id
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('restaurant_id, role')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          setError('Failed to load your profile');
          setLoading(false);
          return;
        }

        console.log('Profile data:', profile);

        if (profile?.restaurant_id) {
          console.log('Restaurant association found in profile:', profile.restaurant_id);
          setRestaurantId(profile.restaurant_id);
          setLoading(false);
          return;
        }

        // If not found in profile.restaurant_id and user is a manager, check restaurants table
        if (profile?.role === 'manager') {
          console.log('User is a manager, checking restaurants table');
          const { data: restaurant, error: restaurantError } = await supabase
            .from('restaurants')
            .select('id')
            .eq('manager_id', user.id)
            .maybeSingle();

          if (restaurantError) {
            console.error('Error fetching restaurant:', restaurantError);
          } else if (restaurant?.id) {
            console.log('Restaurant found with manager_id:', restaurant.id);
            setRestaurantId(restaurant.id);
            setLoading(false);
            return;
          }
        }

        // No restaurant association found
        console.error('No restaurant association found for user');
        setError('No restaurant association found for your account');
        setLoading(false);
      } catch (error) {
        console.error('Error checking restaurant association:', error);
        setError('Failed to check restaurant association');
        setLoading(false);
      }
    };

    checkRestaurantAssociation();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col pt-safe-top">
      <ActiveRollersHeader />

      <div className="flex-1 p-4">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">
            <p>{error}</p>
            <p className="text-sm mt-2">Try logging out and logging back in to resolve this issue.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        ) : restaurantId ? (
          <ActiveRollersList 
            recentlyScannedToken={recentlyScannedToken} 
            restaurantId={restaurantId} 
          />
        ) : (
          <div className="text-center py-4 text-red-500">
            <p>No restaurant association found for your account.</p>
            <p className="text-sm mt-2">You need to be associated with a restaurant to view active tokens.</p>
          </div>
        )}
      </div>
      
      <RestaurantNav />
    </div>
  );
};

export default ActiveRollers;
