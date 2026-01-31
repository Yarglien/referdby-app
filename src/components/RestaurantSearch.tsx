import { Input } from "@/components/ui/input";
import { KeyboardEvent, useRef, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { checkRedemptionEligibility } from "@/utils/redemption/eligibilityChecker";
import { checkRedemptionAvailability } from "@/utils/redemption/availabilityChecker";
import { useTranslation } from 'react-i18next';

interface RestaurantSearchProps {
  searchTerm: string;
  onSearch: (term: string) => void;
  onSelectRestaurant: (restaurant: any) => void;
  selectedRestaurant: any;
  isLoading?: boolean;
  onEligibilityCheck?: (isEligible: boolean, message?: string, restaurant?: any) => void;
}

export const RestaurantSearch = ({ 
  searchTerm, 
  onSearch, 
  onSelectRestaurant,
  selectedRestaurant,
  isLoading,
  onEligibilityCheck
}: RestaurantSearchProps) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [showResults, setShowResults] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  // Get user location for Google Places search
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.log('Location access denied:', error)
      );
    }
  }, []);

  // Search ReferdBy restaurants first
  const { data: restaurants = [] } = useQuery({
    queryKey: ['restaurants', searchTerm],
    queryFn: async () => {
      if (!searchTerm) return [];
      
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .ilike('name', `%${searchTerm}%`)
        .limit(5);
      
      if (error) {
        console.error('Error fetching restaurants:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: searchTerm.length > 0
  });

  // Search Google Places when no ReferdBy restaurants found
  const { data: googlePlacesResults = [] } = useQuery({
    queryKey: ['google-places', searchTerm, userLocation],
    queryFn: async () => {
      if (!searchTerm || !userLocation || restaurants.length > 0) return [];
      
      try {
        const { data, error } = await supabase.functions.invoke('fetch-google-places', {
          body: {
            restaurantName: searchTerm,
            latitude: userLocation.lat,
            longitude: userLocation.lng
          }
        });

        if (error) {
          console.error('Google Places search error:', error);
          return [];
        }

        if (data?.success && data?.restaurant?.matched) {
          return [{
            ...data.restaurant,
            isExternal: true,
            id: `external-${data.restaurant.place_id}`
          }];
        }

        return [];
      } catch (error) {
        console.error('Google Places search failed:', error);
        return [];
      }
    },
    enabled: searchTerm.length > 0 && !!userLocation && restaurants.length === 0
  });

  const allResults = [...restaurants, ...googlePlacesResults];

  useEffect(() => {
    if (inputRef.current) {
      const currentSelectionStart = inputRef.current.selectionStart;
      const currentSelectionEnd = inputRef.current.selectionEnd;
      inputRef.current.setSelectionRange(currentSelectionStart, currentSelectionEnd);
    }
  }, [searchTerm]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch((e.target as HTMLInputElement).value);
    }
  };

  const handleRestaurantSelect = async (restaurant: any) => {
    onSelectRestaurant(restaurant);
    onSearch(restaurant.name);
    setShowResults(false);
    
    // For external restaurants, skip eligibility check and show no points message
    if (restaurant.isExternal) {
      if (onEligibilityCheck) {
        onEligibilityCheck(true, "This restaurant is not on ReferdBy yet - no points will be earned", restaurant);
      }
      return;
    }
    
    // Check eligibility for ReferdBy restaurants
    if (onEligibilityCheck) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const eligibilityResult = await checkRedemptionEligibility(user.id, restaurant.id);
          onEligibilityCheck(eligibilityResult.eligible, eligibilityResult.message, restaurant);
        }
      } catch (error) {
        console.error('Error checking redemption eligibility:', error);
        onEligibilityCheck(true, undefined, restaurant);
      }
    }
  };

  return (
    <div className="relative">
      <Input 
        ref={inputRef}
        type="search" 
        placeholder={t('redeem.searchRestaurantsByName')} 
        className="w-full"
        value={selectedRestaurant ? selectedRestaurant.name : searchTerm}
        onChange={(e) => {
          onSearch(e.target.value);
          setShowResults(true);
          if (selectedRestaurant) {
            onSelectRestaurant(null);
          }
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => setShowResults(true)}
        disabled={isLoading}
      />
      
      {showResults && searchTerm && allResults.length > 0 && (
        <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-auto">
          <div className="p-2">
            {allResults.map((restaurant) => (
              <div
                key={restaurant.id}
                className="p-2 hover:bg-accent cursor-pointer rounded"
                onClick={() => handleRestaurantSelect(restaurant)}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">{restaurant.name}</div>
                  {restaurant.isExternal && (
                    <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                      Not on ReferdBy
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {restaurant.address}
                </div>
                {restaurant.isExternal ? (
                  <div className="text-xs mt-1 text-orange-600">
                    No points available - Help us sign up this restaurant!
                  </div>
                ) : (
                  <div className="text-xs mt-1">
                    {(() => {
                      const availability = checkRedemptionAvailability(restaurant);
                      return (
                        <span className="text-muted-foreground">
                          {availability.message}
                        </span>
                      );
                    })()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};