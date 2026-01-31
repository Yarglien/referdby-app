import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RestaurantNav } from "@/components/RestaurantNav";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ServerList } from "@/components/server-admin/ServerList";
import { InviteGenerator } from "@/components/server-admin/InviteGenerator";
import { RemoveServerDialog } from "@/components/server-admin/RemoveServerDialog";
import { PhotoRequirementToggle } from "@/components/server-admin/PhotoRequirementToggle";
import { useTranslation } from 'react-i18next';

interface Server {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
}

const ServerAdministration = () => {
  const navigate = useNavigate();
  const { supabase } = useSupabase();
  const [serverToRemove, setServerToRemove] = useState<Server | null>(null);
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  // Fetch the manager's restaurant
  const { data: managerRestaurant, isLoading: isLoadingRestaurant, error: restaurantError } = useQuery({
    queryKey: ['manager-restaurant'],
    queryFn: async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('User error:', userError);
        throw userError;
      }

      if (!user) {
        console.error('No user found');
        throw new Error("Not authenticated");
      }

      console.log('Fetching restaurant for manager:', user.id);
      // Changed to select() instead of single() to handle empty results gracefully
      const { data: restaurants, error } = await supabase
        .from('restaurants')
        .select('id, name')
        .eq('manager_id', user.id);

      if (error) {
        console.error('Restaurant fetch error:', error);
        throw error;
      }
      
      // Return the first restaurant if exists, otherwise null
      return restaurants && restaurants.length > 0 ? restaurants[0] : null;
    }
  });

  // Fetch active servers for the restaurant
  const { data: servers = [], isLoading: isLoadingServers, error: serversError } = useQuery({
    queryKey: ['active-servers', managerRestaurant?.id],
    enabled: !!managerRestaurant?.id,
    queryFn: async () => {
      if (!managerRestaurant?.id) {
        console.log('No restaurant found for manager');
        return [];
      }

      console.log('Fetching servers for restaurant:', managerRestaurant.id);
      
      const { data: serverProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email, role')
        .eq('restaurant_id', managerRestaurant.id)
        .eq('role', 'server');

      if (profilesError) {
        console.error('Server profiles fetch error:', profilesError);
        throw profilesError;
      }
      
      console.log('Found server profiles:', serverProfiles);
      return serverProfiles || [];
    }
  });

  // Handle errors
  if (restaurantError) {
    console.error('Restaurant error:', restaurantError);
    toast.error("Failed to load restaurant information");
  }

  if (serversError) {
    console.error('Servers error:', serversError);
    toast.error("Failed to load server information");
  }

  const confirmRemoveServer = async () => {
    if (!serverToRemove) return;

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          role: 'customer',
          restaurant_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', serverToRemove.id);

      if (updateError) throw updateError;

      queryClient.invalidateQueries({ queryKey: ['active-servers'] });
      
      toast.success(`${serverToRemove.name || 'Server'} has been removed`);
      setServerToRemove(null);
    } catch (error) {
      console.error('Error removing server:', error);
      toast.error("Failed to remove server");
    }
  };

  // If no restaurant is found, show a message
  if (!isLoadingRestaurant && !managerRestaurant) {
    return (
      <div className="min-h-screen bg-background pt-safe-top">
        <header className="p-4 flex items-center gap-2 border-b">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-semibold">{t('restaurant.serverAdministration')}</h1>
        </header>
        
        <main className="p-6">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">{t('restaurant.noRestaurantAssigned')}</p>
            <Button onClick={() => navigate('/restaurant-manager')}>
              {t('restaurant.returnToRestaurantManager')}
            </Button>
          </div>
        </main>

        <RestaurantNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 pt-safe-top">
      <header className="p-4 flex items-center gap-2 border-b">
        <Button variant="ghost" size="icon" onClick={() => navigate("/restaurant-manager")}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-semibold">{t('restaurant.serverAdministration')}</h1>
      </header>

      <main className="p-6 space-y-8">
        {managerRestaurant && (
          <>
            <PhotoRequirementToggle restaurantId={managerRestaurant.id} />
            <InviteGenerator restaurantId={managerRestaurant.id} inviteType="manager" />
            <InviteGenerator restaurantId={managerRestaurant.id} inviteType="server" />
          </>
        )}

        <section>
          <h2 className="text-lg font-medium mb-4">{t('restaurant.activeServers')}</h2>
          {isLoadingRestaurant || isLoadingServers ? (
            <div className="text-muted-foreground">{t('restaurant.loadingServers')}</div>
          ) : (
            <ServerList 
              servers={servers}
              onRemoveServer={setServerToRemove}
            />
          )}
        </section>

        {/* Save Button */}
        <div className="flex justify-center pt-6">
          <Button 
            onClick={() => navigate("/restaurant-manager")}
            className="min-w-[120px]"
          >
            Save
          </Button>
        </div>
      </main>

      <RemoveServerDialog
        server={serverToRemove}
        onClose={() => setServerToRemove(null)}
        onConfirm={confirmRemoveServer}
      />

      <RestaurantNav />
    </div>
  );
};

export default ServerAdministration;
