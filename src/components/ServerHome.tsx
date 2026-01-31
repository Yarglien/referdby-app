import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RestaurantNav } from "@/components/RestaurantNav";
import { ServerNav } from "@/components/ServerNav";
import { useEffect } from "react";

const ServerHome = () => {
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Not authenticated",
          description: "Please sign in to continue",
        });
      }
    };

    checkAuth();
  }, [toast]);

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data } = await supabase
        .from('profiles')
        .select('*, restaurant:restaurant_id(id, name, photos)')
        .eq('id', user.id)
        .single();
      
      return data;
    },
  });

  const restaurantData = profile?.restaurant && typeof profile.restaurant === 'object' 
    ? profile.restaurant as { id: string; name: string; photos: string[] }
    : null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold">Server Home</h1>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex flex-col items-start">
              {restaurantData?.photos?.[0] ? (
                <img
                  src={restaurantData.photos[0]}
                  alt={restaurantData.name}
                  className="w-24 h-24 rounded-full object-cover mb-4"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                  <span className="text-lg font-semibold text-muted-foreground">
                    {restaurantData?.name?.substring(0, 2).toUpperCase() || 'N/A'}
                  </span>
                </div>
              )}
              <h2 className="text-lg font-semibold">{restaurantData?.name || 'No Restaurant Assigned'}</h2>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/scan-customer-code">
            <Button className="w-full">Scan Customer QR</Button>
          </Link>
          <Link to="/server-activity">
            <Button className="w-full">My Activity</Button>
          </Link>
        </div>
      </div>

      <ServerNav />
    </div>
  );
};

export default ServerHome;
