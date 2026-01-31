import { Button } from "@/components/ui/button";

interface Restaurant {
  id: string;
  name: string;
  address: string;
}

interface RestaurantsNeedingGeocodingProps {
  restaurants: Restaurant[];
  processingRestaurant: string | null;
  onTriggerGeocoding: (restaurantId: string, address: string) => void;
}

export const RestaurantsNeedingGeocoding = ({
  restaurants,
  processingRestaurant,
  onTriggerGeocoding
}: RestaurantsNeedingGeocodingProps) => {
  if (restaurants.length === 0) return null;

  return (
    <div className="p-4 bg-muted/50 mb-4">
      <h2 className="text-lg font-semibold mb-2">Restaurants Needing Geocoding</h2>
      <div className="space-y-2">
        {restaurants.map((restaurant) => (
          <div key={restaurant.id} className="flex items-center justify-between bg-background p-2 rounded-lg">
            <div>
              <p className="font-medium">{restaurant.name}</p>
              <p className="text-sm text-muted-foreground">{restaurant.address}</p>
            </div>
            <Button 
              onClick={() => onTriggerGeocoding(restaurant.id, restaurant.address)}
              disabled={processingRestaurant === restaurant.id}
            >
              {processingRestaurant === restaurant.id ? 'Processing...' : 'Geocode'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};