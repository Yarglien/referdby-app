import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, QrCode } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from "react-router-dom";
import { useReferralCreation } from "@/hooks/useReferralCreation";

interface Restaurant {
  id: string;
  name: string;
  address: string;
  cuisine_type: string;
  distance?: number;
  referral_count?: number;
}

interface RestaurantSearchProps {
  onRestaurantSelect: (restaurant: Restaurant) => void;
  selectedRestaurantIds: string[];
  buttonText?: string;
  disabled?: boolean;
}

export const RestaurantSearch = ({ 
  onRestaurantSelect, 
  selectedRestaurantIds, 
  buttonText = "Add",
  disabled = false 
}: RestaurantSearchProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Restaurant[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();
  const { createReferral } = useReferralCreation();

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter a restaurant name or location to search",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    try {
      // Escape special characters and wrap in quotes for PostgREST
      const escapedSearch = searchTerm.replace(/"/g, '\\"');
      const searchPattern = `%${escapedSearch}%`;
      
      // Search for restaurants by name or address - wrap patterns in double quotes to handle commas
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name, address, cuisine_type, referral_count')
        .or(`name.ilike."${searchPattern}",address.ilike."${searchPattern}",cuisine_type.ilike."${searchPattern}"`)
        .limit(20);

      if (error) throw error;

      setSearchResults(data || []);
      setShowResults(true);

      if (data && data.length === 0) {
        toast({
          title: "No Results",
          description: "No restaurants found matching your search criteria",
        });
      }
    } catch (error) {
      console.error('Error searching restaurants:', error);
      toast({
        title: "Search Error",
        description: "Failed to search restaurants. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const isRestaurantSelected = (restaurantId: string) => {
    return selectedRestaurantIds.includes(restaurantId);
  };

  const handleCreateReferral = async (restaurant: Restaurant) => {
    try {
      const referral = await createReferral(restaurant.id, restaurant);
      if (referral) {
        navigate(`/referral-qr/${referral.id}`);
      }
    } catch (error) {
      console.error('Error creating referral:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={t('referrals.searchRestaurantsOrLocations')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10"
          />
        </div>
        <Button 
          onClick={handleSearch} 
          disabled={isSearching || !searchTerm.trim()}
        >
          <Search className="h-4 w-4 mr-2" />
          {isSearching ? 'Searching...' : 'Search'}
        </Button>
      </div>

      {showResults && (
        <Card className="p-4 max-h-60 overflow-y-auto">
          <h4 className="font-medium mb-3">Search Results ({searchResults.length})</h4>
          {searchResults.length === 0 ? (
            <p className="text-muted-foreground text-sm">No restaurants found</p>
          ) : (
            <div className="space-y-2">
              {searchResults.map((restaurant) => (
                <div
                  key={restaurant.id}
                  className={`p-3 border rounded-lg flex justify-between items-start ${
                    isRestaurantSelected(restaurant.id) 
                      ? 'bg-primary/10 border-primary' 
                      : 'hover:bg-accent'
                  }`}
                >
                  <div className="flex-1">
                    <Link 
                      to={`/restaurant-listing/${restaurant.id}`}
                      className="hover:text-primary transition-colors"
                    >
                      <h5 className="font-medium hover:underline">{restaurant.name}</h5>
                    </Link>
                    <p className="text-sm text-muted-foreground">{restaurant.cuisine_type}</p>
                    <p className="text-xs text-muted-foreground">{restaurant.address}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleCreateReferral(restaurant)}
                    >
                      <QrCode className="h-3 w-3 mr-1" />
                      Refer
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onRestaurantSelect(restaurant)}
                      disabled={disabled || isRestaurantSelected(restaurant.id)}
                      variant={isRestaurantSelected(restaurant.id) ? "secondary" : "default"}
                    >
                      {isRestaurantSelected(restaurant.id) ? (
                        "Selected"
                      ) : (
                        <>
                          <Plus className="h-3 w-3 mr-1" />
                          {buttonText}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};