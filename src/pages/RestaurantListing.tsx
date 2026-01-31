
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2 } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { useState } from "react";
import { RestaurantImages } from "@/components/restaurant/listing/RestaurantImages";
import { ScheduleDisplay } from "@/components/restaurant/listing/ScheduleDisplay";
import { Schedule } from "@/integrations/supabase/types/activity.types";
import { useReferralCreation } from "@/hooks/useReferralCreation";
import { ReferralQRDialog } from "@/components/referrals/ReferralQRDialog";

const DEFAULT_IMAGES = ['/placeholder.svg'];

const RestaurantListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showReferralQR, setShowReferralQR] = useState(false);
  const [referralId, setReferralId] = useState<string | null>(null);
  const { createReferral, isLoading: isCreatingReferral } = useReferralCreation();

  const { data: restaurant, isLoading, error } = useQuery({
    queryKey: ['restaurant-basic', id],
    queryFn: async () => {
      if (!id) throw new Error('No restaurant ID provided');
      console.log('Attempting to fetch data for restaurant ID:', id);

      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching restaurant:', error);
        throw error;
      }

      if (!data) {
        console.error('Restaurant not found with ID:', id);
        throw new Error('Restaurant not found');
      }

      console.log('Successfully fetched restaurant:', data.name);
      return data;
    },
    enabled: !!id
  });

  const handleNextImage = () => {
    if (restaurant?.photos) {
      setCurrentImageIndex((prev) => 
        prev === restaurant.photos!.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handlePrevImage = () => {
    if (restaurant?.photos) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? restaurant.photos!.length - 1 : prev - 1
      );
    }
  };

  const handleCreateReferral = async () => {
    if (!restaurant) return;
    
    const referral = await createReferral(restaurant.id, restaurant);
    if (referral) {
      setReferralId(referral.id);
      setShowReferralQR(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-destructive">Failed to load restaurant details</p>
      </div>
    );
  }

  const displayImages = restaurant.photos?.length ? restaurant.photos : DEFAULT_IMAGES;
  const openingHoursSchedule = restaurant.opening_hours_schedule as Schedule[];
  const redemptionSchedule = restaurant.redemption_schedule as Schedule[];

  return (
    <div className="min-h-screen bg-background pb-20 pt-safe-top">
      <div className="p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>

        <RestaurantImages
          images={displayImages}
          currentImageIndex={currentImageIndex}
          onPrevImage={handlePrevImage}
          onNextImage={handleNextImage}
        />

        <div className="space-y-6 mt-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{restaurant.name}</h1>
              <p className="text-muted-foreground">{restaurant.cuisine_type}</p>
            </div>
            <Button 
              onClick={handleCreateReferral}
              disabled={isCreatingReferral}
              className="ml-4"
            >
              <Share2 className="h-4 w-4 mr-2" />
              {isCreatingReferral ? 'Creating...' : 'Refer'}
            </Button>
          </div>

          {restaurant.description && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-muted-foreground">{restaurant.description}</p>
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold mb-2">Contact Details</h2>
            <div className="space-y-1 text-muted-foreground">
              <p>{restaurant.address}</p>
              {restaurant.telephone && <p>Phone: {restaurant.telephone}</p>}
              {restaurant.website && (
                <a 
                  href={restaurant.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Visit Website
                </a>
              )}
            </div>
          </div>

          <ScheduleDisplay
            title="Opening Hours"
            schedule={openingHoursSchedule}
            timezone={restaurant.timezone}
          />

          <ScheduleDisplay
            title="Points Redemption Hours"
            schedule={redemptionSchedule}
            timezone={restaurant.timezone}
          />

          <div>
            <h2 className="text-lg font-semibold mb-2">Amenities</h2>
            <div className="space-y-1 text-sm">
              {restaurant.has_wifi && <p>✓ WiFi Available</p>}
              {restaurant.has_parking && <p>✓ Parking Available</p>}
              {restaurant.is_wheelchair_accessible && <p>✓ Wheelchair Accessible</p>}
              {restaurant.accepts_credit_cards && <p>✓ Accepts Credit Cards</p>}
              {restaurant.has_outdoor_seating && <p>✓ Outdoor Seating</p>}
              {restaurant.is_family_friendly && <p>✓ Family Friendly</p>}
              {restaurant.has_vegetarian_options && <p>✓ Vegetarian Options</p>}
              {restaurant.has_vegan_options && <p>✓ Vegan Options</p>}
              {restaurant.has_gluten_free_options && <p>✓ Gluten Free Options</p>}
              {restaurant.accepts_reservations && <p>✓ Accepts Reservations</p>}
              {restaurant.has_delivery && <p>✓ Delivery Available</p>}
              {restaurant.has_takeout && <p>✓ Takeout Available</p>}
            </div>
          </div>
        </div>
      </div>
      
      {referralId && (
        <ReferralQRDialog
          isOpen={showReferralQR}
          onClose={() => {
            setShowReferralQR(false);
            setReferralId(null);
          }}
          referralCode={referralId}
          type="referral"
          title="Referral Created"
          description="Share this QR code with friends to refer them to this restaurant"
        />
      )}
      
      <BottomNav />
    </div>
  );
};

export default RestaurantListing;
