import { useLoadScript } from "@react-google-maps/api";
import { GOOGLE_MAPS_LIBRARIES } from "@/utils/mapUtils";
import { MapSection } from "@/components/referrals/MapSection";

interface Position {
  lat: number;
  lng: number;
}

interface MapsLoaderProps {
  apiKey: string;
  restaurants: any[];
  userLocation: Position;
  setUserLocation: (location: Position) => void;
  setMapBounds: (bounds: google.maps.LatLngBounds) => void;
  onRestaurantSelect?: (restaurant: any) => void;
}

export const MapsLoader = ({
  apiKey,
  restaurants,
  userLocation,
  setUserLocation,
  setMapBounds,
  onRestaurantSelect,
}: MapsLoaderProps) => {
  const { isLoaded, loadError } = useLoadScript({
    id: "google-maps-script",
    googleMapsApiKey: apiKey,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  if (loadError) {
    console.error("Google Maps failed to load:", loadError);
    return (
      <div className="px-4 py-8 text-center">
        <div className="space-y-2">
          <p className="text-destructive">Google Maps failed to load.</p>
          <p className="text-sm text-muted-foreground">
            Check API key restrictions for domain: {typeof window !== 'undefined' ? window.location.host : ''}
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="px-4 py-8 text-center">
        <div className="animate-pulse">
          <div className="h-64 bg-muted rounded-lg mb-4"></div>
          <p className="text-muted-foreground">Loading maps...</p>
        </div>
      </div>
    );
  }

  return (
    <MapSection
      restaurants={restaurants}
      userLocation={userLocation}
      isLoaded={isLoaded}
      setUserLocation={setUserLocation}
      setMapBounds={setMapBounds}
      onRestaurantSelect={onRestaurantSelect}
    />
  );
};