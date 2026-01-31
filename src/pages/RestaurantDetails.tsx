import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Loader } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { RestaurantNav } from "@/components/RestaurantNav";
import { RestaurantFormFields } from "@/components/RestaurantFormFields";
import { useRestaurantForm } from "@/hooks/useRestaurantForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { managementButtons } from "@/config/buttonConfig";
import { useTranslation } from 'react-i18next';

const RestaurantDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { restaurantId } = useParams();
  const formInitialized = useRef(false);
  const [restaurant, setRestaurant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

  // Get the next path based on current route
  const currentButton = managementButtons.find(button => button.path === location.pathname);
  const nextPath = currentButton?.nextPath;

  const effectiveRestaurantId = restaurantId || restaurant?.id;
  const { form, onSubmit } = useRestaurantForm(effectiveRestaurantId, nextPath);

  useEffect(() => {
    const loadRestaurant = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('Not authenticated');
        }

        let query = supabase.from('restaurants').select('*');
        
        if (restaurantId) {
          // Fetch specific restaurant by ID
          query = query.eq('id', restaurantId);
        } else {
          // Fetch manager's restaurant
          query = query.eq('manager_id', user.id);
        }

        const { data, error } = restaurantId 
          ? await query.single()
          : await query.maybeSingle();

        if (error) {
          console.error('Restaurant query error:', error);
          throw error;
        }
        
        setRestaurant(data);
      } catch (error) {
        console.error('Error loading restaurant:', error);
        toast({
          title: t('common.error'),
          description: t('restaurant.failedToLoadDetails'),
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadRestaurant();
  }, [restaurantId]); // Only depend on restaurantId

  useEffect(() => {
    if (restaurant && !formInitialized.current) {
      const formData = {
        restaurantName: restaurant.name || '',
        street_number: restaurant.street_number || '',
        street_name: restaurant.street_name || '',
        county_region: restaurant.county_region || '',
        state: restaurant.state || '',
        country: restaurant.country || '',
        postal_code: restaurant.postal_code || '',
        cuisine_type: restaurant.cuisine_type || '',
        description: restaurant.description || '',
        telephoneNumber: restaurant.telephone || '',
        website: restaurant.website || '',
        currency: restaurant.currency || '',
        address: restaurant.address || '',
        latitude: restaurant.latitude || undefined,
        longitude: restaurant.longitude || undefined,
        plus_code: restaurant.plus_code || '',
        opening_hours_schedule: restaurant.opening_hours_schedule || [],
        redemption_schedule: restaurant.redemption_schedule || [],
        timezone: restaurant.timezone || '',
        photos: restaurant.photos || []
      };
      
      form.reset(formData);
      formInitialized.current = true;
    }
  }, [restaurant]); // Only run when restaurant data actually loads

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>{t('restaurant.loadingDetails')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 pt-safe-top">
      <div className="p-4 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/restaurant-manager")}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold">
            {effectiveRestaurantId ? t('restaurant.editRestaurant') : t('restaurant.newRestaurant')}
          </h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <RestaurantFormFields form={form} />
            <div className="flex justify-center">
              <Button type="submit">
                {form.formState.isSubmitting ? t('common.saving') : (nextPath && nextPath !== "/restaurant-manager" ? t('common.saveContinue') : (effectiveRestaurantId ? t('common.update') : t('common.save')))}
              </Button>
            </div>
          </form>
        </Form>
      </div>
      <RestaurantNav />
    </div>
  );
};

export default RestaurantDetails;