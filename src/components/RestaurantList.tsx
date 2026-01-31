import { useMemo } from "react";
import { RestaurantCard } from "./RestaurantCard";
import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";

interface Restaurant {
  id: string;
  name: string;
  address: string;
  cuisine_type: string;
  distance: number;
  referral_count: number;
}

interface RestaurantListProps {
  restaurants: Restaurant[];
  onCreateReferral: (restaurantId: string) => Promise<string>;
  cuisineFilter?: string;
  onCuisineFilterChange?: (value: string) => void;
  cuisineTypes?: string[];
}

export const RestaurantList = ({ 
  restaurants, 
  onCreateReferral,
  cuisineFilter = "all",
  onCuisineFilterChange,
  cuisineTypes: externalCuisineTypes,
}: RestaurantListProps) => {
  const { t } = useTranslation();

  // Get unique cuisine types from restaurants (fallback if not provided externally)
  const cuisineTypes = useMemo(() => {
    if (externalCuisineTypes) return externalCuisineTypes;
    
    const types = new Set<string>();
    restaurants.forEach((r) => {
      if (r.cuisine_type) {
        // Normalize to title case for display
        const normalized = r.cuisine_type.charAt(0).toUpperCase() + r.cuisine_type.slice(1).toLowerCase();
        types.add(normalized);
      }
    });
    return Array.from(types).sort();
  }, [restaurants, externalCuisineTypes]);

  // Filter restaurants by cuisine type
  const filteredRestaurants = useMemo(() => {
    if (cuisineFilter === "all") return restaurants;
    return restaurants.filter((r) => 
      r.cuisine_type?.toLowerCase() === cuisineFilter.toLowerCase()
    );
  }, [restaurants, cuisineFilter]);

  const handleFilterChange = (value: string) => {
    if (onCuisineFilterChange) {
      onCuisineFilterChange(value);
    }
  };

  return (
    <div className="px-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-medium text-primary">{t('referrals.tenNearestRestaurants')}</h2>
        
        <Select value={cuisineFilter} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-[140px] h-8 text-sm">
            <Filter className="h-3.5 w-3.5 mr-1.5" />
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            <SelectItem value="all">All Types</SelectItem>
            {cuisineTypes.map((cuisine) => (
              <SelectItem key={cuisine} value={cuisine.toLowerCase()}>
                {cuisine}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filteredRestaurants.length === 0 && cuisineFilter !== "all" ? (
          <p className="text-center text-muted-foreground py-4">
            {t('referrals.noRestaurantsForCuisine', 'No restaurants found for this cuisine type.')}
          </p>
        ) : filteredRestaurants.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            {t('referrals.noNearbyReferdBy', 'No ReferdBy restaurants within 25 miles of this location.')}
          </p>
        ) : (
          filteredRestaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              onCreateReferral={onCreateReferral}
            />
          ))
        )}
      </div>
    </div>
  );
};
