import { RestaurantsNeedingGeocoding } from "@/components/RestaurantsNeedingGeocoding";

interface GeocodingSectionProps {
  userRole: string | null;
  restaurantsWithoutCoords: any[];
  processingRestaurant: string | null;
  triggerGeocoding: (restaurantId: string, address: string) => void;
}

export const GeocodingSection = ({
  userRole,
  restaurantsWithoutCoords,
  processingRestaurant,
  triggerGeocoding
}: GeocodingSectionProps) => {
  if (userRole !== 'manager' && userRole !== 'admin') return null;

  return (
    <RestaurantsNeedingGeocoding
      restaurants={restaurantsWithoutCoords}
      processingRestaurant={processingRestaurant}
      onTriggerGeocoding={triggerGeocoding}
    />
  );
};