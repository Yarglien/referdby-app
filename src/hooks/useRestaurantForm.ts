
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { RestaurantDetailsForm } from "@/types/restaurant.types";
import { transformFormDataToRestaurantData } from "@/utils/restaurantDataUtils";

export const useRestaurantForm = (restaurantId?: string, nextPath?: string) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const session = useSession();
  const form = useForm<RestaurantDetailsForm>({
    defaultValues: {
      restaurantName: '',
      street_number: '',
      street_name: '',
      county_region: '',
      state: '',
      country: '',
      postal_code: '',
      cuisine_type: '',
      description: '',
      telephoneNumber: '',
      website: '',
      currency: '',
      address: '',
      latitude: null,
      longitude: null,
      plus_code: '',
      opening_hours_schedule: [],
      redemption_schedule: [],
      timezone: '',
      photos: []
    }
  });

  const verifyManagerRole = async (userId: string) => {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw new Error("Could not verify manager status");
    }

    if (profile.role !== 'manager') {
      throw new Error("Only managers can create or update restaurants");
    }
  };

  const saveRestaurant = async (restaurantData: any, restaurantId?: string) => {
    console.log('About to save restaurant with this data:', restaurantData);
    console.log('Currency value being saved:', restaurantData.currency);
    
    let result;
    if (restaurantId) {
      console.log('Updating existing restaurant with ID:', restaurantId);
      result = await supabase
        .from('restaurants')
        .update(restaurantData)
        .eq('id', restaurantId)
        .select()
        .single();
    } else {
      console.log('Creating new restaurant');
      result = await supabase
        .from('restaurants')
        .insert([restaurantData])
        .select()
        .single();
    }

    console.log('Database save result:', result);
    console.log('Saved restaurant currency:', result.data?.currency);
    return result;
  };

  const verifyCoordinates = async (restaurantId: string) => {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const { data: updatedRestaurant, error: fetchError } = await supabase
      .from('restaurants')
      .select('latitude, longitude')
      .eq('id', restaurantId)
      .single();

    if (fetchError) {
      console.error('Error fetching updated restaurant:', fetchError);
      throw fetchError;
    }

    return updatedRestaurant;
  };

  const onSubmit = async (data: RestaurantDetailsForm) => {
    console.log('=== FORM ONSUBMIT CALLED ===');
    try {
      console.log('=== FORM SUBMISSION START ===');
      console.log('Raw form data received:', data);
      console.log('Currency from form:', data.currency);
      console.log('Photos from form:', data.photos);
      console.log('Number of photos in form:', data.photos?.length || 0);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "Please sign in to update restaurant details",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // Skip manager role verification and referer_id lookup for speed
      const restaurantData = transformFormDataToRestaurantData(data, user.id, restaurantId, null);
      
      const { data: restaurant, error } = await saveRestaurant(restaurantData, restaurantId);

      if (error) {
        console.error('Database error:', error);
        if (error.code === 'PGRST301') {
          throw new Error("You don't have permission to save restaurant details. Please ensure you're logged in as a manager.");
        }
        throw new Error(error.message);
      }

      console.log('Successfully saved restaurant:', restaurant);
      console.log('Final saved currency:', restaurant.currency);

      // Show success immediately - no coordinate verification needed
      toast({
        title: "Success",
        description: "Restaurant details saved successfully",
      });

      console.log('=== FORM SUBMISSION END ===');
      // Navigate to next step or back to manager home
      navigate(nextPath || "/restaurant-manager");
    } catch (error) {
      console.error('Error saving restaurant:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save restaurant details. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    form,
    onSubmit,
  };
};
