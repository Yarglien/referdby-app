import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Edit, Trash2, QrCode, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ReferralQRDialog } from "./ReferralQRDialog";

interface FavoriteList {
  id: string;
  name: string;
  description: string | null;
  restaurant_ids: string[];
  created_at: string;
}

interface Restaurant {
  id: string;
  name: string;
  address: string;
  cuisine_type: string;
}

interface FavoritesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  restaurants: Restaurant[];
}

export const FavoritesDialog = ({ isOpen, onClose, restaurants }: FavoritesDialogProps) => {
  const [favoriteLists, setFavoriteLists] = useState<FavoriteList[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingList, setEditingList] = useState<FavoriteList | null>(null);
  const [newListName, setNewListName] = useState("");
  const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>([]);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [selectedListForQR, setSelectedListForQR] = useState<FavoriteList | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchFavoriteLists();
    }
  }, [isOpen]);

  const fetchFavoriteLists = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('favorite_lists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFavoriteLists(data || []);
    } catch (error) {
      console.error('Error fetching favorite lists:', error);
      toast({
        title: "Error",
        description: "Failed to load favorite lists",
        variant: "destructive"
      });
    }
  };

  const saveFavoriteList = async () => {
    if (!newListName.trim() || selectedRestaurants.length === 0) {
      toast({
        title: "Error",
        description: "Please enter a name and select at least one restaurant",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (editingList) {
        // Update existing list
        const { error } = await supabase
          .from('favorite_lists')
          .update({
            name: newListName,
            restaurant_ids: selectedRestaurants
          })
          .eq('id', editingList.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Favorite list updated successfully"
        });
      } else {
        // Create new list
        const { error } = await supabase
          .from('favorite_lists')
          .insert({
            user_id: user.id,
            name: newListName,
            restaurant_ids: selectedRestaurants
          });

        if (error) throw error;
        toast({
          title: "Success",
          description: "Favorite list created successfully"
        });
      }

      setNewListName("");
      setSelectedRestaurants([]);
      setEditingList(null);
      fetchFavoriteLists();
    } catch (error) {
      console.error('Error saving favorite list:', error);
      toast({
        title: "Error",
        description: "Failed to save favorite list",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFavoriteList = async (listId: string) => {
    try {
      const { error } = await supabase
        .from('favorite_lists')
        .delete()
        .eq('id', listId);

      if (error) throw error;
      toast({
        title: "Success",
        description: "Favorite list deleted successfully"
      });
      fetchFavoriteLists();
    } catch (error) {
      console.error('Error deleting favorite list:', error);
      toast({
        title: "Error",
        description: "Failed to delete favorite list",
        variant: "destructive"
      });
    }
  };

  const editFavoriteList = (list: FavoriteList) => {
    setEditingList(list);
    setNewListName(list.name);
    setSelectedRestaurants(list.restaurant_ids);
  };

  const generateQRCode = (list: FavoriteList) => {
    setSelectedListForQR(list);
    setShowQRDialog(true);
  };

  const getRestaurantName = (restaurantId: string) => {
    const restaurant = restaurants.find(r => r.id === restaurantId);
    return restaurant?.name || 'Unknown Restaurant';
  };

  const toggleRestaurantSelection = (restaurantId: string) => {
    setSelectedRestaurants(prev =>
      prev.includes(restaurantId)
        ? prev.filter(id => id !== restaurantId)
        : [...prev, restaurantId]
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>My Favorite Lists</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Create/Edit Form */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">
                {editingList ? 'Edit Favorite List' : 'Create New Favorite List'}
              </h3>
              
              <div className="space-y-4">
                <Input
                  placeholder="List name (e.g., 'Fav Places in NYC', 'Best Pizzas in Brooklyn')"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                />

                <div className="space-y-4">
                  <h4 className="font-medium">Local Restaurants</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                    {restaurants.map((restaurant) => (
                      <div
                        key={restaurant.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedRestaurants.includes(restaurant.id)
                            ? 'bg-primary/10 border-primary'
                            : 'hover:bg-accent'
                        }`}
                        onClick={() => toggleRestaurantSelection(restaurant.id)}
                      >
                        <h4 className="font-medium">{restaurant.name}</h4>
                        <p className="text-sm text-muted-foreground">{restaurant.cuisine_type}</p>
                        <p className="text-xs text-muted-foreground">{restaurant.address}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={saveFavoriteList} disabled={isLoading}>
                    <Plus className="h-4 w-4 mr-2" />
                    {editingList ? 'Update List' : 'Create List'}
                  </Button>
                  {editingList && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setEditingList(null);
                        setNewListName("");
                        setSelectedRestaurants([]);
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {/* Existing Lists */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Your Favorite Lists</h3>
              {favoriteLists.length === 0 ? (
                <p className="text-muted-foreground">No favorite lists created yet.</p>
              ) : (
                favoriteLists.map((list) => (
                  <Card key={list.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold">{list.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {list.restaurant_ids.length} restaurant(s)
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {list.restaurant_ids.slice(0, 3).map((restaurantId) => (
                            <span
                              key={restaurantId}
                              className="text-xs bg-accent px-2 py-1 rounded"
                            >
                              {getRestaurantName(restaurantId)}
                            </span>
                          ))}
                          {list.restaurant_ids.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{list.restaurant_ids.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generateQRCode(list)}
                        >
                          <QrCode className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => editFavoriteList(list)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteFavoriteList(list.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {selectedListForQR && (
        <ReferralQRDialog
          isOpen={showQRDialog}
          onClose={() => {
            setShowQRDialog(false);
            setSelectedListForQR(null);
          }}
          referralCode={selectedListForQR.id}
          type="referral"
          title="Share Favorite List"
          description={`Share "${selectedListForQR.name}" with others using this QR code`}
        />
      )}
    </>
  );
};
