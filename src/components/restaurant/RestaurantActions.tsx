
import { Cog } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { managementButtons, commonButtons } from "@/config/buttonConfig";
import { toast } from "sonner";
import { ReferralQRDialog } from "@/components/ReferralQRDialog";
import { useQuery } from "@tanstack/react-query";
import { PublishRestaurantButton } from "@/components/restaurant/PublishRestaurantButton";
import { useTranslation } from 'react-i18next';

interface RestaurantActionsProps {
  restaurantId?: string;
}

export const RestaurantActions = ({ restaurantId }: RestaurantActionsProps) => {
  const navigate = useNavigate();
  const [showQR, setShowQR] = useState(false);
  const [tokenId, setTokenId] = useState<string>("");
  const { t } = useTranslation();

  const { data: restaurant } = useQuery({
    queryKey: ['restaurant-full-data', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return null;
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single();
      
      if (error) {
        console.error('Error fetching restaurant:', error);
        return null;
      }
      return data;
    },
    enabled: !!restaurantId
  });

  const handleGenerateToken = async () => {
    try {
      console.log('🚀 Starting token generation...', { restaurantId });
      
      if (!restaurantId) {
        console.error('❌ No restaurant ID available');
        toast.error(t('restaurant.noRestaurantAssociated'));
        return;
      }

      console.log('🔧 Creating token directly in database...');
      
      // Create token directly using RPC or a simplified approach
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 4);
      expiryDate.setHours(23, 59, 59, 999);

      const { data: token, error } = await supabase
        .from('dice_tokens')
        .insert({
          restaurant_id: restaurantId,
          created_by: 'a0b782e1-76bf-4444-9cf8-c54146d3d6db', // Your user ID directly
          created_at: new Date().toISOString(),
          expires_at: expiryDate.toISOString(),
          is_active: true,
          token_state: 'created'
        })
        .select()
        .single();

      console.log('📦 Insert result:', { token, error });

      if (error) {
        console.error('❌ Token creation error:', error);
        toast.error(t('rollToken.failedToGenerate', { error: error.message }));
        return;
      }

      if (token) {
        console.log('✅ Token created successfully:', token);
        setTokenId(token.id);
        setShowQR(true);
        toast.success(t('rollToken.tokenGeneratedSuccess'));
      } else {
        console.error('❌ No token returned');
        toast.error(t('rollToken.failedToGenerate'));
      }
    } catch (error) {
      console.error('💥 Error in handleGenerateToken:', error);
      toast.error(t('rollToken.errorGeneratingToken'));
    }
  };

  const visibleCommonButtons = commonButtons.filter(button => {
    // Filter out both Active Rollers and Roll for Meal buttons if the option is disabled
    if (button.label === "Active Rollers" || button.label === "Code for Roll for Meal") {
      return restaurant?.has_roll_meal_offer;
    }
    return true;
  });

  const getButtonLabel = (buttonLabel: string) => {
    const labelMap: { [key: string]: string } = {
      "Restaurant Details": t('restaurant.actions.restaurantDetails'),
      "Restaurant Amenities": t('restaurant.actions.restaurantAmenities'), 
      "Restaurant Images": t('restaurant.actions.restaurantImages'),
      "Opening Hours": t('restaurant.actions.openingHours'),
      "Redemption Profiles": t('restaurant.actions.redemptionProfiles'),
      "Server Administration": t('restaurant.actions.serverAdministration'),
      "Active Referrals": t('restaurant.actions.activeReferrals'),
      "Active Redeemers": t('restaurant.actions.activeRedeemers'),
      "Scan Customer Code": t('restaurant.actions.scanCustomerCode'),
      "Code for Roll for Meal": t('restaurant.actions.codeForRollMeal'),
      "Active Rollers": t('restaurant.actions.activeRollers')
    };
    return labelMap[buttonLabel] || buttonLabel;
  };

  const buttonClassName = "group flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-accent transition-colors";
  const iconClassName = "w-6 h-6 text-primary group-hover:text-black transition-colors";
  const textClassName = "font-medium group-hover:text-black transition-colors";

  return (
    <div className="flex flex-col space-y-4 max-w-xl">
      <ReferralQRDialog
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        referralCode={tokenId}
        type="referral"
        title={t('rollToken.rollForFreeMeal')}
        description={t('rollToken.rollForFreeMealDescription')}
      />

      <Dialog>
        <DialogTrigger asChild>
          <button className={buttonClassName}>
            <Cog className={iconClassName} />
            <span className={textClassName}>{t('restaurant.actions.manageRestaurantDetails')}</span>
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <div className="grid gap-4 py-4">
            {managementButtons.map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={buttonClassName}
              >
                <item.icon className={iconClassName} />
                <span className={textClassName}>{getButtonLabel(item.label)}</span>
              </button>
            ))}
          </div>
          
          <div className="border-t pt-4">
            {restaurant && <PublishRestaurantButton restaurant={restaurant} />}
          </div>
        </DialogContent>
      </Dialog>

      {visibleCommonButtons.map((item) => (
        <button
          key={item.label}
          onClick={() => {
            if (item.label === "Code for Roll for Meal") {
              handleGenerateToken();
            } else {
              navigate(item.path);
            }
          }}
          className={buttonClassName}
        >
          <item.icon className={iconClassName} />
          <span className={textClassName}>{getButtonLabel(item.label)}</span>
        </button>
      ))}
    </div>
  );
};
