import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Rocket, AlertTriangle } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useTranslation } from "react-i18next";

interface PublishRestaurantButtonProps {
  restaurant: any;
}

export const PublishRestaurantButton = ({ restaurant }: PublishRestaurantButtonProps) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const { t } = useTranslation();

  const validateRestaurant = () => {
    const requiredFields = {
      name: t("restaurant.publish.requiredFields.name"),
      address: t("restaurant.publish.requiredFields.address"), 
      cuisine_type: t("restaurant.publish.requiredFields.cuisineType"),
      description: t("restaurant.publish.requiredFields.description"),
      currency: t("restaurant.publish.requiredFields.currency")
    };

    const missingFields = [];
    const warnings = [];

    // Check required fields
    for (const [field, label] of Object.entries(requiredFields)) {
      if (!restaurant?.[field] || restaurant[field].trim() === '') {
        missingFields.push(label);
      }
    }

    // Check optional but recommended fields
    if (!restaurant?.photos || restaurant.photos.length === 0) {
      warnings.push(t("restaurant.publish.warnings.noPhotos"));
    }

    // Check if amenities have been set (any boolean amenity field set to true)
    const amenityFields = [
      'has_outdoor_seating', 'has_wifi', 'has_vegan_options', 'has_delivery',
      'has_parking', 'has_vegetarian_options', 'has_takeout', 'has_gluten_free_options',
      'accepts_credit_cards', 'is_wheelchair_accessible', 'accepts_reservations',
      'is_family_friendly'
    ];
    
    const hasAnyAmenities = amenityFields.some(field => restaurant?.[field] === true);
    if (!hasAnyAmenities) {
      warnings.push(t("restaurant.publish.warnings.noAmenities"));
    }

    return { missingFields, warnings };
  };

  const handlePublish = async () => {
    if (!restaurant?.id) {
      toast.error(t("restaurant.publish.errors.noRestaurant"));
      return;
    }

    const isCurrentlyPublished = restaurant.is_published;

    if (!isCurrentlyPublished) {
      const { missingFields, warnings } = validateRestaurant();

      if (missingFields.length > 0) {
        toast.error(t("restaurant.publish.errors.missingFields", { fields: missingFields.join(', ') }));
        return;
      }

      if (warnings.length > 0) {
        toast.warning(t("restaurant.publish.warnings.canPublish", { warnings: warnings.join(', ') }));
      }
    }

    setIsPublishing(true);
    
    try {
      // Toggle published status
      const { error } = await supabase
        .from('restaurants')
        .update({ 
          is_published: !isCurrentlyPublished,
          published_at: !isCurrentlyPublished ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', restaurant.id);

      if (error) throw error;

      if (!isCurrentlyPublished) {
        toast.success(t("restaurant.publish.success.published"));
      } else {
        toast.success(t("restaurant.publish.success.unpublished"));
      }
      
    } catch (error) {
      console.error('Error updating restaurant:', error);
      toast.error(t("restaurant.publish.errors.failed", { action: isCurrentlyPublished ? t("restaurant.publish.actions.unpublish") : t("restaurant.publish.actions.publish") }));
    } finally {
      setIsPublishing(false);
    }
  };

  const { missingFields, warnings } = validateRestaurant();
  const canPublish = missingFields.length === 0;
  const isPublished = restaurant?.is_published;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="default" 
          className={`${
            isPublished || canPublish 
              ? "" 
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          disabled={isPublishing || (!isPublished && !canPublish)}
        >
          <Rocket className="w-4 h-4 mr-2" />
          {isPublishing 
            ? (isPublished ? t("restaurant.publish.actions.unpublishing") : t("restaurant.publish.actions.publishing")) 
            : (isPublished ? t("restaurant.publish.actions.unpublishRestaurant") : t("restaurant.publish.actions.publishGoLive"))
          }
        </Button>
      </AlertDialogTrigger>
      
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Rocket className="w-5 h-5" />
            {isPublished ? t("restaurant.publish.dialog.unpublishTitle") : t("restaurant.publish.dialog.publishTitle")}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            {missingFields.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  {t("restaurant.publish.dialog.requiredFieldsMissing")}
                </div>
                <ul className="text-red-700 text-sm space-y-1">
                  {missingFields.map((field, index) => (
                    <li key={index}>• {field}</li>
                  ))}
                </ul>
                <p className="text-red-700 text-sm mt-2">
                  {t("restaurant.publish.dialog.completeFields")}
                </p>
              </div>
            )}
            
            {canPublish && warnings.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-yellow-800 font-medium mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  {t("restaurant.publish.dialog.recommendations")}
                </div>
                <ul className="text-yellow-700 text-sm space-y-1">
                  {warnings.map((warning, index) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
                <p className="text-yellow-700 text-sm mt-2">
                  {t("restaurant.publish.dialog.optionalRecommended")}
                </p>
              </div>
            )}
            
            {canPublish && warnings.length === 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-800">
                  {t("restaurant.publish.dialog.readyToLive")}
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
          {(isPublished || canPublish) && (
            <AlertDialogAction 
              onClick={handlePublish}
              disabled={isPublishing}
              className=""
            >
              {isPublishing 
                ? (isPublished ? t("restaurant.publish.actions.unpublishing") : t("restaurant.publish.actions.publishing")) 
                : (isPublished ? t("restaurant.publish.actions.unpublishRestaurant") : t("restaurant.publish.actions.publishRestaurant"))
              }
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};