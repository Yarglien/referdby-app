import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ReferralQRDialog } from "@/components/ReferralQRDialog";
import { useReferralCreation } from "@/hooks/useReferralCreation";
import { RestaurantDetails } from "@/components/restaurant/RestaurantDetails";
import { RestaurantLocation } from "@/components/restaurant/RestaurantLocation";
import { DirectionsButton } from "@/components/DirectionsButton";
import { useToast } from "@/hooks/use-toast";
import { formatTodaySchedule } from "@/utils/scheduleHelpers";
import { Schedule } from "@/integrations/supabase/types/activity.types";

interface Restaurant {
  id: string;
  name: string;
  address: string;
  cuisine_type: string;
  distance: number;
  referral_count: number;
  current_points?: string | null;
  return_rate?: number | null;
  opening_hours_schedule?: Schedule[];
  redemption_schedule?: Schedule[];
  isExternal?: boolean;
  latitude?: number | null;
  longitude?: number | null;
}

interface RestaurantCardProps {
  restaurant: Restaurant;
  onCreateReferral: (restaurantId: string) => Promise<string>;
}

export const RestaurantCard = ({ restaurant, onCreateReferral }: RestaurantCardProps) => {
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [referralId, setReferralId] = useState<string | null>(null);
  const { createReferral, isLoading } = useReferralCreation();
  const { toast } = useToast();

  const handleCreateReferral = async () => {
    try {
      const referral = await createReferral(restaurant.id, restaurant);
      if (referral) {
        setReferralId(referral.id);
        setShowQRDialog(true);
        toast({
          title: restaurant.isExternal ? "External Referral Created" : "Referral Created",
          description: restaurant.isExternal 
            ? "Referral created for restaurant not yet on ReferdBy"
            : "Share this QR code with friends visiting " + restaurant.name,
        });
      }
    } catch (error) {
      console.error('Error creating referral:', error);
    }
  };

  return (
    <>
      <div className="p-4 rounded-lg border">
        <div className="flex justify-between items-start mb-2">
          <RestaurantDetails
            id={restaurant.id}
            name={restaurant.name}
            cuisine_type={restaurant.cuisine_type}
            current_points={restaurant.current_points}
          />
          <div className="flex items-center gap-2">
            <DirectionsButton
              address={restaurant.address}
              latitude={restaurant.latitude}
              longitude={restaurant.longitude}
              name={restaurant.name}
              variant="outline"
              size="icon"
            />
            <Button 
              onClick={handleCreateReferral}
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Refer"}
            </Button>
          </div>
        </div>
        <RestaurantLocation
          address={restaurant.address}
          distance={restaurant.distance}
          referral_count={restaurant.referral_count}
          return_rate={restaurant.return_rate}
        />
        
        {/* Schedule Information */}
        <div className="mt-2 text-xs text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>Open today:</span>
            <span>{formatTodaySchedule(restaurant.opening_hours_schedule || [])}</span>
          </div>
          <div className="flex justify-between">
            <span>Redemption:</span>
            <span>{formatTodaySchedule(restaurant.redemption_schedule || [])}</span>
          </div>
        </div>
      </div>

      {referralId && (
        <ReferralQRDialog
          isOpen={showQRDialog}
          onClose={() => setShowQRDialog(false)}
          referralCode={referralId}
          type="referral"
        />
      )}
    </>
  );
};
