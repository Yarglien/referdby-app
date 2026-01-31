import React from "react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ActivityType } from "@/integrations/supabase/types/enums.types";
import { Receipt, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActivityCardProps {
  id: string;
  type: ActivityType;
  scannedAt: string | null;
  amount_spent: number | null;
  customer_points: number;
  referrer_points: number;
  restaurant_recruiter_points: number;
  app_referrer_points: number;
  user: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    photo: string | null;
  } | null;
  referrer: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    photo: string | null;
  } | null;
  scanner: {
    id: string;
    first_name: string | null;
    last_name: string | null;
  } | null;
  processed_by: {
    id: string;
    first_name: string | null;
    last_name: string | null;
  } | null;
  onProcess?: () => void;
  buttonText?: string;
}

const formatScannedTime = (scannedAt: string | null) => {
  if (!scannedAt) return "";
  try {
    const today = new Date();
    const [hours, minutes] = scannedAt.split(':');
    const timeDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 
      parseInt(hours), parseInt(minutes));
    return format(timeDate, "p");
  } catch (error) {
    console.error("Error formatting time:", error);
    return scannedAt;
  }
};

const getActivityTypeLabel = (type: ActivityType): string => {
  switch (type) {
    case ActivityType.REDEEM_PROCESSED:
      return "Points Redemption";
    case ActivityType.REFERRAL_PROCESSED:
      return "Meal Purchase";
    default:
      return type.replace(/_/g, ' ').toLowerCase();
  }
};

export const ActivityCard = ({
  id,
  type,
  scannedAt,
  amount_spent,
  user,
  referrer,
  scanner,
  processed_by,
  onProcess,
  buttonText = "Process",
}: ActivityCardProps) => {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-primary/10">
            {user?.photo ? (
              <AvatarImage 
                src={user.photo}
                alt={`${user?.first_name || ''} ${user?.last_name || ''}`}
                className="object-cover"
              />
            ) : (
              <AvatarFallback className="text-lg">
                {user?.first_name?.[0] || ''}{user?.last_name?.[0] || ''}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-base leading-none">
                {user?.first_name} {user?.last_name}
              </h3>
              <span className="text-sm text-muted-foreground">
                • {getActivityTypeLabel(type)}
              </span>
            </div>
            {amount_spent && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Receipt className="w-4 h-4" />
                <span>Bill Amount: ${amount_spent.toFixed(2)}</span>
              </div>
            )}
            {referrer && (
              <div className="flex items-center gap-1.5 text-sm">
                <Avatar className="h-5 w-5">
                  {referrer.photo ? (
                    <AvatarImage 
                      src={referrer.photo}
                      alt={`${referrer.first_name || ''} ${referrer.last_name || ''}`}
                      className="object-cover"
                    />
                  ) : (
                    <AvatarFallback className="text-xs">
                      {referrer.first_name?.[0] || ''}{referrer.last_name?.[0] || ''}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span className="text-muted-foreground">
                  Referred by {referrer.first_name} {referrer.last_name}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <ScanLine className="w-4 h-4" />
              <span>
                {scanner && `Scanned by ${scanner.first_name} ${scanner.last_name}`}
                {processed_by && ` • Processed by ${processed_by.first_name} ${processed_by.last_name}`}
                {scannedAt && ` • ${formatScannedTime(scannedAt)}`}
              </span>
            </div>
          </div>
        </div>
        {onProcess && (
          <Button 
            onClick={onProcess}
            variant="default"
          >
            {buttonText}
          </Button>
        )}
      </div>
    </Card>
  );
};