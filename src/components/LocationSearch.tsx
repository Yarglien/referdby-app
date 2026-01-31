import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { KeyboardEvent, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from "react-router-dom";
import { useReferralCreation } from "@/hooks/useReferralCreation";
import { DirectionsButton } from "@/components/DirectionsButton";

interface Position {
  lat: number;
  lng: number;
}

interface PlacePredictionResult {
  placeId: string;
  mainText: string;
  secondaryText: string;
  types: string[];
  placePrediction?: any;
}

interface GoogleRestaurantResult {
  place_id: string;
  name: string;
  formatted_address: string;
  rating?: number;
  lat?: number;
  lng?: number;
}

interface LocationSearchProps {
  onLocationSelect: (location: Position) => void;
  onRestaurantSelect?: (restaurant: any) => void;
  onGoogleRestaurantsFound?: (restaurants: GoogleRestaurantResult[]) => void;
  googleMapsAvailable?: boolean;
}

export const LocationSearch = ({ onLocationSelect, onRestaurantSelect, onGoogleRestaurantsFound, googleMapsAvailable = true }: LocationSearchProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { createReferral } = useReferralCreation();
  const [searchTerm, setSearchTerm] = useState("");
  const [locationPredictions, setLocationPredictions] = useState<PlacePredictionResult[]>([]);
  const [googleRestaurants, setGoogleRestaurants] = useState<GoogleRestaurantResult[]>([]);
  const [nearbyReferdByRestaurants, setNearbyReferdByRestaurants] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searchLocation, setSearchLocation] = useState<Position | null>(null);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Helper function to calculate distance in miles
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Fetch nearby ReferdBy restaurants when we have a location
  const fetchNearbyReferdByRestaurants = async (location: Position) => {
    console.log('🔍 Fetching ReferdBy restaurants near:', location);
    
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('is_published', true)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);
    
    if (error) {
      console.error('Error fetching nearby restaurants:', error);
      setNearbyReferdByRestaurants([]);
      return;
    }
    
    // Filter by distance (25 miles)
    const MAX_DISTANCE_MILES = 25;
    const nearbyRestaurants = (data || []).filter(restaurant => {
      if (!restaurant.latitude || !restaurant.longitude) return false;
      const distance = calculateDistance(
        location.lat, 
        location.lng, 
        restaurant.latitude, 
        restaurant.longitude
      );
      return distance <= MAX_DISTANCE_MILES;
    });
    
    console.log(`📍 Found ${nearbyRestaurants.length} ReferdBy restaurants within 25 miles`);
    setNearbyReferdByRestaurants(nearbyRestaurants);
  };

  // Use nearbyReferdByRestaurants as the restaurants to display
  const restaurants = nearbyReferdByRestaurants;

  // Search local ReferdBy restaurants by name (no Google needed)
  const searchLocalRestaurants = async (searchValue: string) => {
    console.log('🔍 Searching local ReferdBy restaurants for:', searchValue);
    
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('is_published', true)
      .ilike('name', `%${searchValue}%`);
    
    if (error) {
      console.error('Error searching local restaurants:', error);
      return [];
    }
    
    console.log(`📍 Found ${data?.length || 0} ReferdBy restaurants matching "${searchValue}"`);
    return data || [];
  };

  // Check if the legacy Places API is available
  const hasLegacyPlacesApi = () => {
    return googleMapsAvailable && 
      typeof window !== 'undefined' && 
      !!window.google?.maps?.places?.AutocompleteService &&
      !!window.google?.maps?.places?.PlacesService;
  };

  // Search using the legacy Places API (AutocompleteService + PlacesService)
  const searchWithLegacyApi = async (value: string) => {
    console.log('🔧 Using LEGACY Places API (AutocompleteService)');
    
    try {
      const autocompleteService = new window.google.maps.places.AutocompleteService();
      const tempDiv = document.createElement('div');
      const placesService = new window.google.maps.places.PlacesService(tempDiv);
      
      // Location predictions (cities, regions)
      const locationRequest = {
        input: value,
        types: ['(regions)']
      };
      
      autocompleteService.getPlacePredictions(locationRequest, (predictions, status) => {
        console.log('📍 AutocompleteService (locations) status:', status, 'results:', predictions?.length || 0);
        
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          const formattedLocations: PlacePredictionResult[] = predictions.slice(0, 3).map((p) => ({
            placeId: p.place_id,
            mainText: p.structured_formatting?.main_text || p.description,
            secondaryText: p.structured_formatting?.secondary_text || '',
            types: p.types || []
          }));
          setLocationPredictions(formattedLocations);
          
          // Get coordinates of first location to search for nearby restaurants
          if (predictions[0]) {
            placesService.getDetails(
              { placeId: predictions[0].place_id, fields: ['geometry'] },
              (place, detailStatus) => {
                if (detailStatus === window.google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
                  const searchLoc = {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng()
                  };
                  console.log('📍 Got location for restaurant search:', searchLoc);
                  setSearchLocation(searchLoc);
                  
                  // Fetch ReferdBy restaurants near this location
                  fetchNearbyReferdByRestaurants(searchLoc);
                  
                  // Search Google restaurants near this location
                  searchRestaurantsWithLegacyApi(placesService, searchLoc, value);
                }
                setIsSearchingLocation(false);
              }
            );
          } else {
            setIsSearchingLocation(false);
          }
        } else {
          setLocationPredictions([]);
          // Fallback: search restaurants without location bias
          searchRestaurantsWithLegacyApi(placesService, null, value);
          setIsSearchingLocation(false);
        }
      });
    } catch (error) {
      console.error('❌ Error with legacy Places API:', error);
      setLocationPredictions([]);
      setGoogleRestaurants([]);
      setIsSearchingLocation(false);
    }
  };

  // Search restaurants using legacy API
  const searchRestaurantsWithLegacyApi = (
    placesService: google.maps.places.PlacesService, 
    location: Position | null, 
    searchValue: string
  ) => {
    try {
      if (location) {
        // Use nearbySearch with location for accurate local results
        const nearbyRequest: google.maps.places.PlaceSearchRequest = {
          location: new window.google.maps.LatLng(location.lat, location.lng),
          radius: 8000, // 8km (~5 miles)
          type: 'restaurant',
          keyword: searchValue.split(',')[0] // Use just the main search term
        };
        
        placesService.nearbySearch(nearbyRequest, (results, status) => {
          console.log('🍽️ PlacesService nearbySearch status:', status, 'results:', results?.length || 0);
          handleLegacyRestaurantResults(results, status);
        });
      } else {
        // Fallback to textSearch if no location
        const textRequest = {
          query: `${searchValue} restaurant`,
          type: 'restaurant'
        };
        
        placesService.textSearch(textRequest, (results, status) => {
          console.log('🍽️ PlacesService textSearch status:', status, 'results:', results?.length || 0);
          handleLegacyRestaurantResults(results, status);
        });
      }
    } catch (restaurantError) {
      console.warn('Restaurant search failed:', restaurantError);
      setGoogleRestaurants([]);
    }
  };

  const handleLegacyRestaurantResults = (
    results: google.maps.places.PlaceResult[] | null, 
    status: google.maps.places.PlacesServiceStatus
  ) => {
    if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
      // Sort by rating (highest first) and take top 5
      const sortedResults = [...results]
        .filter(place => place.rating !== undefined)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 5);
      
      // Convert to our format
      const formattedResults: GoogleRestaurantResult[] = sortedResults.map(place => ({
        place_id: place.place_id || '',
        name: place.name || '',
        formatted_address: place.formatted_address || place.vicinity || '',
        rating: place.rating,
        lat: place.geometry?.location?.lat(),
        lng: place.geometry?.location?.lng()
      }));
      
      console.log('✅ Found Google restaurants (legacy API):', formattedResults.length);
      setGoogleRestaurants(formattedResults);
      
      if (onGoogleRestaurantsFound) {
        onGoogleRestaurantsFound(formattedResults);
      }
    } else {
      setGoogleRestaurants([]);
      if (onGoogleRestaurantsFound) {
        onGoogleRestaurantsFound([]);
      }
    }
  };

  const handleSearch = async (value: string) => {
    if (!value || value.length < 2) {
      setLocationPredictions([]);
      setGoogleRestaurants([]);
      setNearbyReferdByRestaurants([]);
      setSearchLocation(null);
      setShowResults(false);
      return;
    }
    
    // Set showResults immediately so local results appear
    setShowResults(true);
    setIsSearchingLocation(true);
    
    // Clear previous results when starting a new search
    setNearbyReferdByRestaurants([]);
    setGoogleRestaurants([]);
    
    // Always search local ReferdBy restaurants (works without Google)
    const localResults = await searchLocalRestaurants(value);
    setNearbyReferdByRestaurants(localResults);
    
    // Safety timeout - stop showing loading after 5 seconds regardless
    const searchTimeout = setTimeout(() => {
      console.warn('⏱️ Search timeout - stopping loading state');
      setIsSearchingLocation(false);
    }, 5000);
    
    // Check if we have the legacy Places API
    const hasLegacy = hasLegacyPlacesApi();
    
    console.log('🔍 LocationSearch handleSearch:', { 
      value, 
      googleMapsAvailable,
      hasLegacyApi: hasLegacy,
      hasAutocompleteService: !!window.google?.maps?.places?.AutocompleteService,
      hasPlacesService: !!window.google?.maps?.places?.PlacesService,
      localResultsCount: localResults.length
    });
    
    if (!hasLegacy) {
      console.warn('Google Maps Places API not available - showing local results only');
      clearTimeout(searchTimeout);
      setLocationPredictions([]);
      setGoogleRestaurants([]);
      setIsSearchingLocation(false);
      // Keep showResults true so local results display
      return;
    }

    // Use the legacy Places API
    try {
      await searchWithLegacyApi(value);
    } finally {
      clearTimeout(searchTimeout);
    }
  };

  const handleLocationSelect = async (placeId: string, prediction?: PlacePredictionResult) => {
    if (!hasLegacyPlacesApi()) return;

    try {
      const tempDiv = document.createElement('div');
      const placesService = new window.google.maps.places.PlacesService(tempDiv);
      
      placesService.getDetails(
        { placeId, fields: ['geometry', 'formatted_address', 'name'] },
        (place, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
            const location = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            };
            
            console.log(`📍 Selected location:`, place.name, location);
            
            onLocationSelect(location);
            setShowResults(false);
            if (place.formatted_address) {
              setSearchTerm(place.formatted_address);
            }
          }
        }
      );
    } catch (error) {
      console.error('Error fetching place details:', error);
    }
  };

  const handleGoogleRestaurantSelect = (restaurant: GoogleRestaurantResult) => {
    if (onRestaurantSelect) {
      onRestaurantSelect({
        id: `external-${restaurant.place_id}`,
        name: restaurant.name,
        address: restaurant.formatted_address,
        isExternal: true,
        place_id: restaurant.place_id,
        lat: restaurant.lat,
        lng: restaurant.lng
      });
      setSearchTerm(restaurant.name);
      setShowResults(false);
    }
  };

  const handleRestaurantSelect = (restaurant: any) => {
    if (onRestaurantSelect) {
      onRestaurantSelect(restaurant);
      setSearchTerm(restaurant.name);
      setShowResults(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch((e.target as HTMLInputElement).value);
    }
  };

  const handleCreateReferral = async (restaurant: any) => {
    try {
      const referral = await createReferral(restaurant.id, restaurant);
      if (referral) {
        navigate(`/referral-qr/${referral.id}`);
      }
    } catch (error) {
      console.error('Error creating referral:', error);
    }
  };

  const handleCreateExternalReferral = async (restaurant: GoogleRestaurantResult) => {
    try {
      const referral = await createReferral(restaurant.place_id, {
        place_id: restaurant.place_id,
        name: restaurant.name,
        address: restaurant.formatted_address,
        isExternal: true
      });
      if (referral) {
        navigate(`/referral-qr/${referral.id}`);
      }
    } catch (error) {
      console.error('Error creating referral:', error);
    }
  };

  return (
    <div className="relative mb-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input 
          ref={inputRef}
          type="search" 
          placeholder={t('referrals.searchRestaurantsOrLocations')} 
          className="w-full pl-10 border-2 border-primary/20 focus:border-primary/50 rounded-lg shadow-sm"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            handleSearch(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowResults(true)}
        />
      </div>
      
      {showResults && (locationPredictions.length > 0 || restaurants.length > 0 || googleRestaurants.length > 0 || isSearchingLocation) && (
        <Card className="absolute z-50 w-full mt-1 max-h-96 overflow-auto">
          {/* Show loading state while searching */}
          {isSearchingLocation && restaurants.length === 0 && googleRestaurants.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                <span>Searching restaurants...</span>
              </div>
            </div>
          )}
          {/* Show Location predictions first */}
          {locationPredictions.length > 0 && (
            <div className="p-2 border-b">
              <div className="text-xs font-semibold text-muted-foreground px-2 py-1">
                {t('referrals.locations', 'Locations')}
              </div>
              {locationPredictions.map((prediction) => (
                <div
                  key={prediction.placeId}
                  className="p-3 hover:bg-accent cursor-pointer rounded transition-colors"
                  onClick={() => handleLocationSelect(prediction.placeId, prediction)}
                >
                  <div className="font-semibold text-sm">{prediction.mainText}</div>
                  <div className="text-xs text-muted-foreground">{prediction.secondaryText}</div>
                </div>
              ))}
            </div>
          )}
          
          <div className="p-2">
            {/* Show local ReferdBy restaurants */}
            {restaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="p-3 border-b border-border last:border-b-0 hover:bg-accent rounded"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link 
                        to={`/restaurant-listing/${restaurant.id}`}
                        className="font-medium hover:text-primary transition-colors hover:underline"
                        onClick={() => setShowResults(false)}
                      >
                        {restaurant.name}
                      </Link>
                      <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                        ReferdBy Restaurant
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {restaurant.address}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-2">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCreateReferral(restaurant);
                      }}
                    >
                      Refer
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Show message and Google restaurants if fewer than 10 ReferdBy restaurants nearby */}
            {searchLocation && restaurants.length < 10 && googleRestaurants.length > 0 && (
              <div className="p-3 text-center text-muted-foreground border-b">
                <p className="text-sm">{restaurants.length === 0 ? 'No ReferdBy restaurants within 25 miles of this location.' : `Found ${restaurants.length} ReferdBy restaurant${restaurants.length === 1 ? '' : 's'} nearby.`}</p>
                <p className="text-xs mt-1">Top rated restaurants in the area:</p>
              </div>
            )}
            
            {/* Show Google restaurant results */}
            {googleRestaurants.map((place) => (
              <div
                key={place.place_id}
                className="p-3 border-b border-border last:border-b-0 hover:bg-accent rounded"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-medium">{place.name}</div>
                      <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                        Not on ReferdBy
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {place.formatted_address}
                    </div>
                    <div className="text-xs mt-1 text-orange-600">
                      No points available - Help us sign up this restaurant!
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCreateExternalReferral(place);
                      }}
                    >
                      Refer
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Show location predictions only if no restaurants found */}
            {restaurants.length === 0 && googleRestaurants.length === 0 && locationPredictions.map((prediction) => (
              <div
                key={prediction.placeId}
                className="p-2 hover:bg-accent cursor-pointer rounded"
                onClick={() => handleLocationSelect(prediction.placeId, prediction)}
              >
                <div className="font-medium">{prediction.mainText}</div>
                <div className="text-sm text-muted-foreground">
                  {prediction.secondaryText}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
