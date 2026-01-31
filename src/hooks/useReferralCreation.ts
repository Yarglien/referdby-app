import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { addDays } from "date-fns";

export const useReferralCreation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const createReferral = async (restaurantId: string, restaurantData?: any) => {
    try {
      setIsLoading(true);
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Session check:', { session, error: sessionError });
      
      if (!session) {
        console.log('No session found, redirecting to auth');
        toast({
          title: "Authentication Required",
          description: "Please sign in to create referrals",
          variant: "destructive",
        });
        navigate("/auth");
        return null;
      }

      // Handle external restaurant referrals
      if (restaurantData?.isExternal) {
        console.log('Creating external restaurant referral');
        
        // First, create or find the external restaurant record
        let externalRestaurantId: string;
        
        // Check if external restaurant already exists
        const { data: existingExternal } = await supabase
          .from('external_restaurants')
          .select('id')
          .eq('place_id', restaurantData.place_id)
          .single();

        if (existingExternal) {
          externalRestaurantId = existingExternal.id;
        } else {
          // Create new external restaurant record
          const { data: newExternal, error: externalError } = await supabase
            .from('external_restaurants')
            .insert([{
              place_id: restaurantData.place_id,
              name: restaurantData.name,
              address: restaurantData.address,
              latitude: restaurantData.latitude,
              longitude: restaurantData.longitude,
              phone: restaurantData.phone,
              website: restaurantData.website,
              photos: restaurantData.photos || [],
              opening_hours: restaurantData.opening_hours || [],
              cuisine_type: 'Unknown',
              currency: restaurantData.currency || 'USD'
            }])
            .select('id')
            .single();

          if (externalError) {
            console.error('Error creating external restaurant:', externalError);
            toast({
              title: "Error",
              description: "Failed to save restaurant details",
              variant: "destructive",
            });
            return null;
          }
          
          externalRestaurantId = newExternal.id;
        }

        // Create external referral
        const expiresAt = addDays(new Date(), 30);
        
        const { data: referral, error: referralError } = await supabase
          .from('referrals')
          .insert([{
            creator_id: session.user.id,
            restaurant_id: null,
            external_restaurant_id: externalRestaurantId,
            is_external: true,
            status: 'active',
            expires_at: expiresAt.toISOString()
          }])
          .select()
          .single();

        if (referralError) {
          console.error('Error creating external referral:', referralError);
          toast({
            title: "Error",
            description: `Failed to create referral: ${referralError.message}`,
            variant: "destructive",
          });
          return null;
        }

        console.log('External referral created successfully:', referral);
        toast({
          title: "External Referral Created",
          description: "Referral created for restaurant not yet on ReferdBy. No points will be earned, but you can help us sign them up!",
          variant: "default",
        });
        return referral;
      }

      // Handle regular ReferdBy restaurant referrals
      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .select('id')
        .eq('id', restaurantId)
        .single();

      console.log('Restaurant query result:', { restaurant, error: restaurantError });

      if (restaurantError) {
        console.error('Error fetching restaurant:', restaurantError);
        toast({
          title: "Error",
          description: "Failed to fetch restaurant details",
          variant: "destructive",
        });
        return null;
      }

      if (!restaurant) {
        console.error('No restaurant found');
        toast({
          title: "Error",
          description: "Restaurant not found",
          variant: "destructive",
        });
        return null;
      }

      console.log('Creating referral with restaurant info:', {
        restaurantId,
      });
      
      // Set expiry to 30 days from now
      const expiresAt = addDays(new Date(), 30);
      
      const { data: referral, error: referralError } = await supabase
        .from('referrals')
        .insert([{
          creator_id: session.user.id,
          restaurant_id: restaurantId,
          external_restaurant_id: null,
          is_external: false,
          status: 'active',
          expires_at: expiresAt.toISOString()
        }])
        .select()
        .single();

      console.log('Referral creation result:', { referral, error: referralError });

      if (referralError) {
        console.error('Error creating referral:', referralError);
        toast({
          title: "Error",
          description: `Failed to create referral: ${referralError.message}`,
          variant: "destructive",
        });
        return null;
      }

      if (!referral) {
        console.error('No referral data returned');
        toast({
          title: "Error",
          description: "Failed to create referral: No data returned",
          variant: "destructive",
        });
        return null;
      }

      console.log('Referral created successfully:', referral);
      return referral;

    } catch (error) {
      console.error('Error in createReferral:', error);
      toast({
        title: "Error",
        description: "Failed to create referral. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { createReferral, isLoading };
};