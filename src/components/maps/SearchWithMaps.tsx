import { useLoadScript } from "@react-google-maps/api";
import { useEffect, useState } from "react";
import { GOOGLE_MAPS_LIBRARIES } from "@/utils/mapUtils";
import { LocationSearch } from "@/components/LocationSearch";

interface Position {
  lat: number;
  lng: number;
}

interface GoogleRestaurantResult {
  place_id: string;
  name: string;
  formatted_address: string;
  rating?: number;
  lat?: number;
  lng?: number;
}

interface SearchWithMapsProps {
  apiKey: string;
  onLocationSelect: (location: Position) => void;
  onRestaurantSelect?: (restaurant: any) => void;
  onGoogleRestaurantsFound?: (restaurants: GoogleRestaurantResult[]) => void;
}

export const SearchWithMaps = ({
  apiKey,
  onLocationSelect,
  onRestaurantSelect,
  onGoogleRestaurantsFound,
}: SearchWithMapsProps) => {
  const [isApiReady, setIsApiReady] = useState(false);
  const [apiCheckComplete, setApiCheckComplete] = useState(false);

  const { isLoaded, loadError } = useLoadScript({
    id: "google-maps-script",
    googleMapsApiKey: apiKey,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  // Log the current state for debugging production issues
  useEffect(() => {
    console.log("🗺️ SearchWithMaps state:", { 
      isLoaded, 
      loadError: loadError?.message,
      isApiReady,
      apiCheckComplete,
      hasGoogleObject: typeof window !== 'undefined' && !!window.google,
      hasPlacesAPI: typeof window !== 'undefined' && !!window.google?.maps?.places,
      currentDomain: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
      apiKeyLength: apiKey?.length || 0
    });
  }, [isLoaded, loadError, isApiReady, apiCheckComplete, apiKey]);

  // Poll for Google Maps API availability after isLoaded is true
  useEffect(() => {
    if (loadError) {
      console.error("❌ Google Maps load error:", loadError.message);
      setApiCheckComplete(true);
      return;
    }
    
    if (!isLoaded) {
      console.log("⏳ Google Maps script still loading...");
      return;
    }

    const checkGoogleMaps = () => {
      const places = window.google?.maps?.places as any;
      
      // Check for new Places API (preferred - required for new Google customers as of March 2025)
      const hasNewApi = !!places?.AutocompleteSessionToken && !!places?.AutocompleteSuggestion;
      
      // Also check legacy API as fallback
      const hasLegacyAutocomplete = !!places?.AutocompleteService;
      const hasLegacyPlaces = !!places?.PlacesService;
      
      if (hasNewApi) {
        console.log("✅ Google Maps NEW Places API ready (AutocompleteSuggestion)");
        setIsApiReady(true);
        setApiCheckComplete(true);
        return true;
      }
      
      if (hasLegacyAutocomplete && hasLegacyPlaces) {
        console.log("✅ Google Maps LEGACY Places API ready (AutocompleteService + PlacesService)");
        setIsApiReady(true);
        setApiCheckComplete(true);
        return true;
      }
      
      console.log("⏳ Waiting for Google Maps API...", { 
        hasNewApi,
        hasLegacyAutocomplete,
        hasLegacyPlaces,
        googleMaps: !!window.google?.maps
      });
      return false;
    };

    // Check immediately
    if (checkGoogleMaps()) return;

    // Poll every 100ms for up to 5 seconds
    let attempts = 0;
    const maxAttempts = 50;
    const interval = setInterval(() => {
      attempts++;
      if (checkGoogleMaps() || attempts >= maxAttempts) {
        clearInterval(interval);
        if (attempts >= maxAttempts) {
          console.warn("⚠️ Google Maps API not available after timeout - this may be due to API key restrictions");
          setApiCheckComplete(true);
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isLoaded, loadError]);

  // Show loading only until initial check is complete
  if (!apiCheckComplete) {
    return (
      <div className="text-center text-muted-foreground py-2">
        <div className="flex items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
          <span>Initializing search...</span>
        </div>
      </div>
    );
  }

  // Show error if Google Maps failed to load
  if (loadError) {
    return (
      <div className="text-center text-destructive py-2">
        <p className="text-sm">Failed to load Google Maps</p>
        <p className="text-xs text-muted-foreground mt-1">Please refresh the page or try again later</p>
      </div>
    );
  }

  // Show warning if API isn't ready (but still render LocationSearch for partial functionality)
  if (!isApiReady) {
    return (
      <div className="space-y-2">
        <div className="text-center text-amber-600 py-2 text-sm">
          <p>Search is limited - Google Maps API unavailable</p>
          <p className="text-xs text-muted-foreground mt-1">Please check your browser console for details</p>
        </div>
        <LocationSearch
          onLocationSelect={onLocationSelect}
          onRestaurantSelect={onRestaurantSelect}
          onGoogleRestaurantsFound={onGoogleRestaurantsFound}
          googleMapsAvailable={false}
        />
      </div>
    );
  }

  // Always render LocationSearch - it will handle API availability gracefully
  // This ensures local ReferdBy restaurant search always works
  return (
    <LocationSearch
      onLocationSelect={onLocationSelect}
      onRestaurantSelect={onRestaurantSelect}
      onGoogleRestaurantsFound={onGoogleRestaurantsFound}
      googleMapsAvailable={isApiReady}
    />
  );
};
