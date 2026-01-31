
import { LocationSearch } from "@/components/LocationSearch";
import { RestaurantMap } from "@/components/RestaurantMap";

interface Position {
  lat: number;
  lng: number;
}

interface MapSectionProps {
  restaurants: any[];
  userLocation: Position;
  isLoaded: boolean;
  setUserLocation: (location: Position) => void;
  setMapBounds: (bounds: google.maps.LatLngBounds) => void;
  onRestaurantSelect?: (restaurant: any) => void;
}

export const MapSection = ({
  restaurants,
  userLocation,
  isLoaded,
  setUserLocation,
  setMapBounds,
  onRestaurantSelect
}: MapSectionProps) => {
  return (
    <>
      <div className="px-4">
        <LocationSearch 
          onLocationSelect={setUserLocation} 
          onRestaurantSelect={onRestaurantSelect}
        />
      </div>

      <RestaurantMap
        restaurants={restaurants}
        userLocation={userLocation}
        isLoaded={isLoaded}
        onBoundsChanged={setMapBounds}
      />
    </>
  );
};
