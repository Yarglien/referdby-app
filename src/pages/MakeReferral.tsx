import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { useToast } from "@/hooks/use-toast";
import { BottomNav } from "@/components/BottomNav";
import { RestaurantList } from "@/components/RestaurantList";
import { useRestaurantData } from "@/hooks/useRestaurantData";
import { useReferralCreation } from "@/hooks/useReferralCreation";
import { supabase } from "@/integrations/supabase/client";
import { ReferralHeader } from "@/components/referrals/ReferralHeader";
import { GeocodingSection } from "@/components/referrals/GeocodingSection";
import { MultiReferralDialog } from "@/components/referrals/MultiReferralDialog";
import { FavoritesDialog } from "@/components/referrals/FavoritesDialog";
import { SearchWithMaps } from "@/components/maps/SearchWithMaps";
import { LocationPromptDialog } from "@/components/referrals/LocationPromptDialog";
import { DirectionsButton } from "@/components/DirectionsButton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/contexts/UserContext";
const MakeReferral = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showMultiReferralDialog, setShowMultiReferralDialog] = useState(false);
  const [showFavoritesDialog, setShowFavoritesDialog] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [hasCheckedLocation, setHasCheckedLocation] = useState(false);
  // Interface matching what LocationSearch actually sends
  interface GoogleRestaurantResult {
    place_id: string;
    name: string;
    formatted_address: string;
    rating?: number;
    lat?: number;
    lng?: number;
  }
  const [googleRestaurants, setGoogleRestaurants] = useState<GoogleRestaurantResult[]>([]);
  const [cuisineFilter, setCuisineFilter] = useState<string>("all");

  const { profile, isLoading: profileLoading } = useUser();
  const { createReferral } = useReferralCreation();

  // Fetch Google Maps API key - runs immediately, supabase client handles auth
  const { data: mapsApiKey, isFetching: isKeyFetching, isError: isKeyError, isPending: isKeyPending } = useQuery({
    queryKey: ['google-maps-key'],
    queryFn: async () => {
      console.log('🔑 Fetching Google Maps API key...');
      const { data, error } = await supabase.functions.invoke('get-google-maps-client-key', {
        body: { platform: 'web' }
      });
      if (error || !data?.success) {
        console.error('❌ Failed to fetch Google Maps key:', error || data?.error);
        throw new Error(data?.error || 'Failed to fetch API key');
      }
      console.log('✅ Google Maps API key fetched successfully');
      return data.key;
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    gcTime: 1000 * 60 * 60, // Keep in cache for 1 hour (prevents refetch on navigation)
    retry: 2,
    retryDelay: 1000,
  });

  // Only show loading if we're actually fetching AND don't have cached data
  const isKeyLoading = isKeyFetching && isKeyPending;

  const {
    restaurants,
    isLoading,
    restaurantsWithoutCoords,
    processingRestaurant,
    triggerGeocoding,
  } = useRestaurantData(true, userLocation || { lat: 0, lng: 0 });

  // Cuisine types from ReferdBy restaurants only (Google Places API doesn't provide detailed cuisine info)
  const allCuisineTypes = useMemo(() => {
    const types = new Set<string>();
    
    // Add ReferdBy restaurant cuisine types
    restaurants.forEach((r) => {
      if (r.cuisine_type) {
        const normalized = r.cuisine_type.charAt(0).toUpperCase() + r.cuisine_type.slice(1).toLowerCase();
        types.add(normalized);
      }
    });
    
    return Array.from(types).sort();
  }, [restaurants]);

  // When a cuisine filter is applied, only show filtered ReferdBy restaurants
  // Google restaurants are shown only when "all" is selected (no filter)
  const showGoogleRestaurants = cuisineFilter === "all";

  // Get user's location for distance calculation
  useEffect(() => {
    if (hasCheckedLocation) return;
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(newLocation);
          setHasCheckedLocation(true);
          toast({
            title: "Location Found",
            description: "Showing restaurants near your location",
            variant: "default"
          });
        },
        (error) => {
          console.error("Geolocation error:", error);
          setHasCheckedLocation(true);
          // Show location prompt dialog instead of defaulting to NY
          setShowLocationPrompt(true);
        },
        {
          timeout: 10000,
          enableHighAccuracy: true,
          maximumAge: 300000
        }
      );
    } else {
      // Browser doesn't support geolocation
      setHasCheckedLocation(true);
      setShowLocationPrompt(true);
    }
  }, [toast, hasCheckedLocation]);

  const handleLocationEntered = (location: { lat: number; lng: number }, name: string) => {
    setUserLocation(location);
    setLocationName(name);
    toast({
      title: "Location Set",
      description: `Showing restaurants near ${name}`,
      variant: "default"
    });
  };

  // Set user role from profile context
  useEffect(() => {
    if (profile) {
      setUserRole(profile.role);
    }
  }, [profile]);

  const handleCreateReferral = async (restaurantId: string, targetUserId?: string): Promise<string> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let isInvalidRecentVisit = false;
      
      if (targetUserId) {
        const { data: hasRecentVisit } = await supabase
          .rpc('check_recent_restaurant_visit', {
            p_user_id: targetUserId,
            p_restaurant_id: restaurantId
          });
        
        isInvalidRecentVisit = hasRecentVisit || false;
      }

      const { data: referral, error: referralError } = await supabase
        .from('referrals')
        .insert({
          creator_id: user.id,
          restaurant_id: restaurantId,
          status: 'active',
          is_invalid_recent_visit: isInvalidRecentVisit
        })
        .select()
        .single();

      if (referralError) throw referralError;
      if (!referral) throw new Error('Failed to create referral');

      if (isInvalidRecentVisit) {
        toast({
          title: "Referral Created",
          description: "Note: This person has visited this restaurant recently, so the referral may not be valid for rewards.",
          variant: "default"
        });
      }

      return referral.id;
    } catch (error) {
      console.error('Error creating referral:', error);
      if (error instanceof Error && !error.message.includes('Duplicate referral')) {
        toast({
          title: "Error",
          description: "Failed to create referral",
          variant: "destructive"
        });
      }
      throw error;
    }
  };

  const handleCreateMultipleReferrals = () => {
    setShowMultiReferralDialog(true);
  };

  const handleShowFavorites = () => {
    setShowFavoritesDialog(true);
  };

  const handleSelectRestaurant = async (restaurant: any) => {
    try {
      if (restaurant.isExternal) {
        const referral = await createReferral(restaurant.place_id, restaurant);
        if (referral) {
          navigate(`/referral-qr/${referral.id}`);
        }
      } else {
        const referral = await createReferral(restaurant.id, restaurant);
        if (referral) {
          navigate(`/referral-qr/${referral.id}`);
        }
      }
    } catch (error) {
      console.error('Error creating referral:', error);
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20 pt-safe-top">
      <ReferralHeader
        onCreateMultiple={handleCreateMultipleReferrals} 
        onShowFavorites={handleShowFavorites}
      />

      <GeocodingSection
        userRole={userRole}
        restaurantsWithoutCoords={restaurantsWithoutCoords}
        processingRestaurant={processingRestaurant}
        triggerGeocoding={triggerGeocoding}
      />

      {/* Search Section */}
      <div className="px-4 py-4">
        <Card className="p-4 border-2 border-primary/20 bg-card shadow-sm">
          {isKeyLoading ? (
            <div className="text-center text-muted-foreground py-2">
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                <span>Loading search...</span>
              </div>
            </div>
          ) : isKeyError ? (
            <div className="text-center text-destructive py-2">
              <p className="text-sm">Failed to load search</p>
              <p className="text-xs text-muted-foreground mt-1">Please refresh the page</p>
            </div>
          ) : mapsApiKey ? (
            <SearchWithMaps
              apiKey={mapsApiKey}
              onLocationSelect={(location) => {
                setUserLocation(location);
                // Clear locationName when user does a new search
                if (locationName) setLocationName(null);
              }}
              onRestaurantSelect={handleSelectRestaurant}
              onGoogleRestaurantsFound={setGoogleRestaurants}
            />
          ) : (
            <div className="text-center text-muted-foreground py-2">
              Search unavailable - please refresh
            </div>
          )}
        </Card>
      </div>

      {/* Show location info if manually entered */}
      {locationName && (
        <div className="px-4 pb-2">
          <p className="text-sm text-muted-foreground text-center">
            Showing restaurants near: <span className="font-medium text-foreground">{locationName}</span>
          </p>
        </div>
      )}

      {/* Only show restaurants if location is set */}
      {!userLocation ? (
        <div className="px-4 py-8 text-center">
          <p className="text-muted-foreground">
            Search for a restaurant or location to see restaurants.
          </p>
        </div>
      ) : isLoading ? (
        <div className="px-4 py-8">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
          <p className="text-center text-muted-foreground mt-4">Loading restaurants...</p>
        </div>
      ) : (
        <>
          <RestaurantList
            restaurants={restaurants.slice(0, 10)}
            onCreateReferral={handleCreateReferral}
            cuisineFilter={cuisineFilter}
            onCuisineFilterChange={setCuisineFilter}
            cuisineTypes={allCuisineTypes}
          />
          
          {/* Show Google restaurants only when no cuisine filter is applied */}
          {showGoogleRestaurants && googleRestaurants.length > 0 && (
            <div className="px-4 mt-4">
              <h3 className="font-medium text-primary mb-4">
                {t('referrals.topRatedNearby', 'Top Rated Restaurants Nearby')}
              </h3>
              <div className="space-y-3">
                {googleRestaurants.map((place) => (
                  <Card key={place.place_id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{place.name}</span>
                          <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                            {t('referrals.notOnReferdBy', 'Not on ReferdBy')}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {place.formatted_address}
                        </div>
                        <div className="text-xs mt-1 text-orange-600">
                          {t('referrals.noPointsAvailable', 'No points available - Help us sign up this restaurant!')}
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <DirectionsButton
                          address={place.formatted_address || ''}
                          latitude={place.lat}
                          longitude={place.lng}
                          name={place.name}
                          variant="outline"
                          size="sm"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleSelectRestaurant({
                            place_id: place.place_id,
                            name: place.name,
                            address: place.formatted_address,
                            isExternal: true,
                          })}
                        >
                          {t('referrals.refer', 'Refer')}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <MultiReferralDialog
        isOpen={showMultiReferralDialog}
        onClose={() => setShowMultiReferralDialog(false)}
        restaurants={restaurants}
        onCreateReferral={handleCreateReferral}
      />

      <FavoritesDialog
        isOpen={showFavoritesDialog}
        onClose={() => setShowFavoritesDialog(false)}
        restaurants={restaurants}
      />

      <LocationPromptDialog
        isOpen={showLocationPrompt}
        onClose={() => setShowLocationPrompt(false)}
      />

      <BottomNav />
    </div>
  );
};

export default MakeReferral;
