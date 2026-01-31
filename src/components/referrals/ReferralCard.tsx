import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ReferralAvatar } from "./ReferralAvatar";
import { ReferralCardInfo } from "./ReferralCardInfo";
import { ReferralQRDialog } from "./ReferralQRDialog";
import { DirectionsButton } from "@/components/DirectionsButton";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatTodaySchedule } from "@/utils/scheduleHelpers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ReferralCardProps {
  referral: any;
  onUseReferral: (referral: any) => void;
  buttonText?: string;
  variant?: "active" | "presented" | "used";
}

export const ReferralCard = ({ 
  referral, 
  onUseReferral, 
  buttonText = "Use Referral", 
  variant = "active"
}: ReferralCardProps) => {
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isScanned = referral.status === 'scanned';
  const isPresented = referral.status === 'presented';
  const isProcessed = referral.status === 'used';
  const isInvalidRecentVisit = referral.is_invalid_recent_visit;
  const isExternal = referral.is_external;

  const restaurant = referral.restaurant || referral.external_restaurant;

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('referrals')
        .delete()
        .eq('id', referral.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Referral deleted",
        description: "Your referral has been successfully removed.",
      });
      queryClient.invalidateQueries({ queryKey: ['referrals'] });
      setShowDeleteDialog(false);
    },
    onError: (error) => {
      console.error('Error deleting referral:', error);
      toast({
        title: "Error",
        description: "Failed to delete referral. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleUseReferral = async () => {
    try {
      await onUseReferral(referral);
    } catch (error) {
      console.error('Error in handleUseReferral:', error);
    }
  };

  const handleCardClick = () => {
    if (!isExternal && referral.restaurant?.id) {
      navigate(`/restaurant-listing/${referral.restaurant.id}`);
    }
  };

  return (
    <>
      <div className={cn(
        "relative flex items-center justify-between p-4 rounded-lg shadow mb-4",
        "bg-background border border-border",
        isExternal && "border-orange-200 bg-orange-50/30",
        isPresented && "opacity-50",
        isProcessed && "opacity-50",
        isInvalidRecentVisit && "opacity-60 border-red-200"
      )}>
        {/* Delete button */}
        <button
          onClick={() => setShowDeleteDialog(true)}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-destructive/10 transition-colors group"
          aria-label="Delete referral"
        >
          <X className="h-4 w-4 text-muted-foreground group-hover:text-destructive" />
        </button>
        
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <ReferralAvatar
            imageUrl={restaurant?.photos?.[0]}
            fallbackText={restaurant?.name}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div 
                className={cn(
                  "cursor-pointer hover:text-primary transition-colors",
                  isExternal && "cursor-default"
                )}
                onClick={handleCardClick}
              >
                <ReferralCardInfo
                  restaurantName={restaurant?.name}
                  scannedAt={referral.scanned_at}
                  status={referral.status}
                  isInvalidRecentVisit={isInvalidRecentVisit}
                />
              </div>
              {isExternal && (
                <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                  Not on ReferdBy
                </Badge>
              )}
            </div>
            
            {/* Referrer information */}
            {referral.creator && (
              <div className="flex items-center gap-1.5 mt-2">
                <Avatar className="h-5 w-5">
                  {referral.creator.photo ? (
                    <AvatarImage 
                      src={referral.creator.photo}
                      alt={`${referral.creator.first_name || ''} ${referral.creator.last_name || ''}`}
                      className="object-cover"
                    />
                  ) : (
                    <AvatarFallback className="text-xs">
                      {referral.creator.first_name?.[0] || ''}{referral.creator.last_name?.[0] || ''}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span className="text-xs text-muted-foreground">
                  Referred by {referral.creator.first_name} {referral.creator.last_name}
                </span>
              </div>
            )}
            
            {/* Additional restaurant info */}
            <div className="mt-2 text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-2">
                <span className="flex-1">{restaurant?.address}</span>
                <DirectionsButton
                  address={restaurant?.address || ''}
                  latitude={restaurant?.latitude}
                  longitude={restaurant?.longitude}
                  name={restaurant?.name}
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                />
              </div>
              <div className="flex justify-between">
                <span>{restaurant?.cuisine_type || 'Unknown cuisine'}</span>
              </div>
              {isExternal ? (
                <div className="text-orange-600 font-medium">
                  No points available - Help us sign up this restaurant!
                </div>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span>Open today:</span>
                    <span>{formatTodaySchedule(referral.restaurant?.opening_hours_schedule || [])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Redemption:</span>
                    <span>{formatTodaySchedule(referral.restaurant?.redemption_schedule || [])}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 ml-4">
          {isInvalidRecentVisit ? (
            <Button 
              disabled
              className="opacity-50"
              variant="outline"
              size="sm"
            >
              Cannot Use
            </Button>
          ) : isExternal ? (
            <Button 
              disabled
              className="opacity-50"
              variant="outline"
              size="sm"
            >
              No Points
            </Button>
          ) : (!isProcessed && !isPresented) ? (
            <Button 
              onClick={handleUseReferral}
              variant="default"
              size="sm"
            >
              {buttonText}
            </Button>
          ) : isPresented ? (
            <Button 
              disabled
              className="opacity-50"
              variant="outline"
              size="sm"
            >
              Presented
            </Button>
          ) : null}
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Referral</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this referral for {restaurant?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
