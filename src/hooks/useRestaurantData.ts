
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { calculateDistance } from "@/utils/mapUtils";
import { Schedule, JsonValue } from "@/integrations/supabase/types/activity.types";

interface Position {
  lat: number;
  lng: number;
}

export const useRestaurantData = (isLoaded: boolean, userLocation: Position) => {
  const { toast } = useToast();
  const [mapBounds, setMapBounds] = useState<google.maps.LatLngBounds | null>(null);
  const [processingRestaurant, setProcessingRestaurant] = useState<string | null>(null);

  const { data: joinedData, isLoading: queryLoading, error: queryError } = useQuery({
    queryKey: ['restaurants-joined'],
    queryFn: async () => {
      try {
        console.log('🔍 Starting restaurant data fetch...');
        
        // Check authentication first
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        console.log('🔐 Auth check:', { hasUser: !!user, authError: authError?.message });
        
        if (authError) {
          console.error('❌ Auth error:', authError);
          throw authError;
        }
        
        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurants')
          .select(`
            *,
            opening_hours_schedule,
            redemption_schedule
          `)
          .eq('is_published', true);
        
        console.log('📊 Restaurant query response:', {
          hasData: !!restaurantData,
          dataLength: restaurantData?.length || 0,
          hasError: !!restaurantError,
          error: restaurantError?.message,
          timestamp: new Date().toISOString()
        });
        
        if (restaurantError) {
          console.error('❌ Restaurant query failed:', {
            error: restaurantError.message,
            details: restaurantError.details,
            hint: restaurantError.hint,
            timestamp: new Date().toISOString()
          });
          throw restaurantError;
        }

        if (!restaurantData || restaurantData.length === 0) {
          console.warn('⚠️ No restaurants found in database');
          return [];
        }

        console.log('✅ Processing', restaurantData.length, 'restaurants');
        
        const processedData = restaurantData?.map(restaurant => ({
          ...restaurant,
          opening_hours_schedule: (restaurant.opening_hours_schedule as JsonValue[] || []).map(schedule => ({
            day_of_week: String((schedule as any).day_of_week || ''),
            is_open: Boolean((schedule as any).is_open),
            open_time: (schedule as any).open_time || null,
            close_time: (schedule as any).close_time || null
          })) as Schedule[],
          redemption_schedule: (restaurant.redemption_schedule as JsonValue[] || []).map(schedule => ({
            day_of_week: String((schedule as any).day_of_week || ''),
            is_open: Boolean((schedule as any).is_open),
            open_time: (schedule as any).open_time || null,
            close_time: (schedule as any).close_time || null
          })) as Schedule[]
        })) || [];

        console.log('🎯 Returning processed data:', processedData.length, 'restaurants');
        return processedData;
      } catch (error) {
        console.error('🚨 Restaurant data fetch failed:', error);
        toast({
          title: "Error",
          description: "Failed to load restaurants. Please try refreshing the page.",
          variant: "destructive"
        });
        throw error;
      }
    },
    enabled: true,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Add error logging
  if (queryError) {
    console.error('🚨 useQuery error:', queryError);
  }

  const MAX_DISTANCE_MILES = 25;
  
  const restaurants = (joinedData || [])
    .filter(restaurant => restaurant.latitude && restaurant.longitude)
    .map(restaurant => {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        restaurant.latitude || 0,
        restaurant.longitude || 0
      );
      
      return {
        ...restaurant,
        distance,
        opening_hours_schedule: restaurant.opening_hours_schedule || [],
        redemption_schedule: restaurant.redemption_schedule || []
      };
    })
    .filter(restaurant => restaurant.distance <= MAX_DISTANCE_MILES);

  return {
    restaurants: restaurants.sort((a, b) => a.distance - b.distance).slice(0, 10),
    isLoading: queryLoading,
    restaurantsWithoutCoords: [],
    processingRestaurant,
    triggerGeocoding: async () => {},
    setMapBounds
  };
};
