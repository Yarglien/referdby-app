
import { ArrowLeft, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { RestaurantNav } from "@/components/RestaurantNav";
import { supabase } from "@/integrations/supabase/client";
import { LoadingState } from "@/components/restaurant/LoadingState";
import { ErrorState } from "@/components/restaurant/ErrorState";
import { AmenitiesList } from "@/components/restaurant/AmenitiesList";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from 'react-i18next';

const RestaurantAmenities = () => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const { t } = useTranslation();
  const [amenities, setAmenities] = useState({
    has_wifi: "no",
    has_parking: "no",
    is_wheelchair_accessible: "yes",
    accepts_credit_cards: "no",
    has_outdoor_seating: "no",
    is_family_friendly: "no",
    has_vegetarian_options: "no",
    has_vegan_options: "no",
    has_gluten_free_options: "no",
    accepts_reservations: "no",
    has_delivery: "no",
    has_takeout: "no",
    has_roll_meal_offer: "no"
  });

  // Use the same query pattern as RestaurantDetails to avoid unwanted refetches
  const { data: restaurant, isLoading, error } = useQuery({
    queryKey: ['restaurant-amenities'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Check manager role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw new Error("Failed to verify manager status");
      }

      if (profile.role !== 'manager') {
        throw new Error("Only managers can update restaurant amenities");
      }

      // Get restaurant
      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('manager_id', user.id)
        .maybeSingle();

      if (restaurantError) {
        throw restaurantError;
      }

      if (!restaurant) {
        throw new Error("No restaurant found for this manager");
      }

      return restaurant;
    },
    retry: false,
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false
  });

  // Update amenities when restaurant data loads, but only once
  useEffect(() => {
    if (restaurant) {
      setAmenities({
        has_wifi: restaurant.has_wifi ? "yes" : "no",
        has_parking: restaurant.has_parking ? "yes" : "no",
        is_wheelchair_accessible: restaurant.is_wheelchair_accessible ? "yes" : "no",
        accepts_credit_cards: restaurant.accepts_credit_cards ? "yes" : "no",
        has_outdoor_seating: restaurant.has_outdoor_seating ? "yes" : "no",
        is_family_friendly: restaurant.is_family_friendly ? "yes" : "no",
        has_vegetarian_options: restaurant.has_vegetarian_options ? "yes" : "no",
        has_vegan_options: restaurant.has_vegan_options ? "yes" : "no",
        has_gluten_free_options: restaurant.has_gluten_free_options ? "yes" : "no",
        accepts_reservations: restaurant.accepts_reservations ? "yes" : "no",
        has_delivery: restaurant.has_delivery ? "yes" : "no",
        has_takeout: restaurant.has_takeout ? "yes" : "no",
        has_roll_meal_offer: restaurant.has_roll_meal_offer ? "yes" : "no"
      });
    }
  }, [restaurant?.id]); // Only re-run when restaurant ID changes

  const handleSave = async () => {
    if (!restaurant?.id) {
      toast.error(t('restaurant.noRestaurantFound'));
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({
          has_wifi: amenities.has_wifi === "yes",
          has_parking: amenities.has_parking === "yes",
          is_wheelchair_accessible: amenities.is_wheelchair_accessible === "yes",
          accepts_credit_cards: amenities.accepts_credit_cards === "yes",
          has_outdoor_seating: amenities.has_outdoor_seating === "yes",
          is_family_friendly: amenities.is_family_friendly === "yes",
          has_vegetarian_options: amenities.has_vegetarian_options === "yes",
          has_vegan_options: amenities.has_vegan_options === "yes",
          has_gluten_free_options: amenities.has_gluten_free_options === "yes",
          accepts_reservations: amenities.accepts_reservations === "yes",
          has_delivery: amenities.has_delivery === "yes",
          has_takeout: amenities.has_takeout === "yes",
          has_roll_meal_offer: amenities.has_roll_meal_offer === "yes"
        })
        .eq('id', restaurant.id);

      if (error) throw error;
      
      toast.success(t('restaurant.amenitiesSavedSuccess'));
      navigate("/restaurant-images");
    } catch (error) {
      console.error('Error saving amenities:', error);
      toast.error(t('restaurant.failedToSaveAmenities'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleAmenityChange = (id: string, value: string) => {
    setAmenities(prev => ({ ...prev, [id]: value }));
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error.message} />;
  }

  return (
    <div className="min-h-screen bg-background pb-20 pt-safe-top">
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/restaurant-manager")}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold">{t('restaurant.amenities')}</h1>
        </div>

        <AmenitiesList 
          amenities={amenities} 
          onAmenityChange={handleAmenityChange}
        />

        <div className="flex justify-center mt-6">
          <Button 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                {t('common.saving')}
              </>
            ) : (
              t('common.save')
            )}
          </Button>
        </div>
      </div>
      <RestaurantNav />
    </div>
  );
};

export default RestaurantAmenities;
