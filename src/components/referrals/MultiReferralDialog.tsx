
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RestaurantCard } from "@/components/RestaurantCard";
import { ReferralQRDialog } from "./ReferralQRDialog";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from 'react-i18next';

interface Restaurant {
  id: string;
  name: string;
  address: string;
  cuisine_type: string;
  distance: number;
  referral_count: number;
  current_points?: number | null;
}

interface MultiReferralDialogProps {
  isOpen: boolean;
  onClose: () => void;
  restaurants: Restaurant[];
  onCreateReferral: (restaurantId: string) => Promise<string>;
}

export const MultiReferralDialog = ({
  isOpen,
  onClose,
  restaurants,
  onCreateReferral
}: MultiReferralDialogProps) => {
  const { t } = useTranslation();
  const [selectedRestaurants, setSelectedRestaurants] = useState<Restaurant[]>([]);
  const [referralIds, setReferralIds] = useState<string[]>([]);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleAddRestaurant = async (restaurant: Restaurant) => {
    if (selectedRestaurants.length >= 10) {
      toast.error("Maximum 10 recommendations allowed");
      return;
    }

    if (selectedRestaurants.find(r => r.id === restaurant.id)) {
      toast.error("Restaurant already selected");
      return;
    }

    setIsCreating(true);
    try {
      const referralId = await onCreateReferral(restaurant.id);
      setSelectedRestaurants(prev => [...prev, restaurant]);
      setReferralIds(prev => [...prev, referralId]);
      toast.success(`Added ${restaurant.name} to recommendations`);
    } catch (error) {
      console.error('Error creating referral:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleRemoveRestaurant = (restaurantId: string) => {
    const index = selectedRestaurants.findIndex(r => r.id === restaurantId);
    if (index !== -1) {
      setSelectedRestaurants(prev => prev.filter(r => r.id !== restaurantId));
      setReferralIds(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleFinish = () => {
    if (selectedRestaurants.length === 0 || selectedRestaurants.length > 10) {
      toast.error("Please select 1-10 restaurants");
      return;
    }
    setShowQRDialog(true);
  };

  const handleReset = () => {
    setSelectedRestaurants([]);
    setReferralIds([]);
    setShowQRDialog(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const availableRestaurants = restaurants.filter(
    restaurant => !selectedRestaurants.find(selected => selected.id === restaurant.id)
  );

  // Create combined referral code for QR
  const combinedReferralCode = referralIds.join(',');

  return (
    <>
      <Dialog open={isOpen && !showQRDialog} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('referrals.createMultipleRecommendations')}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Selected Restaurants */}
            {selectedRestaurants.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-3">
                  Selected Recommendations ({selectedRestaurants.length}/10)
                </h3>
                <div className="space-y-2">
                  {selectedRestaurants.map((restaurant) => (
                    <div key={restaurant.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted">
                      <div>
                        <h4 className="font-medium">{restaurant.name}</h4>
                        <p className="text-sm text-gray-600">{restaurant.cuisine_type} • {restaurant.address}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveRestaurant(restaurant.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button onClick={handleFinish} disabled={isCreating}>
                    Generate QR Code for {selectedRestaurants.length} Recommendation{selectedRestaurants.length > 1 ? 's' : ''}
                  </Button>
                  <Button variant="outline" onClick={handleReset}>
                    Start Over
                  </Button>
                </div>
              </div>
            )}

            {/* Add More Restaurants */}
            {selectedRestaurants.length < 10 && availableRestaurants.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">
                    {selectedRestaurants.length === 0 ? 'Select Restaurants to Recommend' : 'Add More Restaurants'}
                  </h3>
                  <Button
                    onClick={() => {
                      toast.info("Save as Favorite feature coming soon!");
                    }}
                    variant="outline"
                    disabled={selectedRestaurants.length === 0}
                    className="text-sm"
                  >
                    Save as Favorite
                  </Button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">Local Restaurants</h4>
                    <div className="space-y-3">
                      {availableRestaurants.map((restaurant) => (
                        <div key={restaurant.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium">{restaurant.name}</h4>
                              <p className="text-sm text-gray-600">{restaurant.cuisine_type}</p>
                              <p className="text-sm text-gray-500">{restaurant.address}</p>
                            </div>
                            <Button 
                              onClick={() => handleAddRestaurant(restaurant)}
                              disabled={isCreating}
                              size="sm"
                            >
                              {isCreating ? "Adding..." : "Add"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedRestaurants.length === 10 && (
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-yellow-800">Maximum of 10 recommendations reached</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {showQRDialog && (
        <ReferralQRDialog
          isOpen={showQRDialog}
          onClose={() => {
            setShowQRDialog(false);
            handleClose();
          }}
          referralCode={combinedReferralCode}
          type="referral"
          title={`${selectedRestaurants.length} Restaurant Recommendation${selectedRestaurants.length > 1 ? 's' : ''}`}
          description={`Share this QR code with friends to recommend: ${selectedRestaurants.map(r => r.name).join(', ')}`}
        />
      )}
    </>
  );
};
