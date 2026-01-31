
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { ReferralCard } from "./ReferralCard";
import { ActivityCard } from "./ActivityCard";
import { Activity, UserProfile } from "@/integrations/supabase/types/activity.types";
import { ActivityType } from "@/integrations/supabase/types/enums.types";

interface ReferralGroupProps {
  date: string;
  activities: Activity[];
  onUseReferral: (activity: Activity) => void;
  buttonText?: string;
  variant?: "active" | "used";
}

export const ReferralGroup = ({ 
  date, 
  activities, 
  onUseReferral, 
  buttonText = "Process",
  variant = "active" 
}: ReferralGroupProps) => {
  return (
    <div className="space-y-3">
      <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 py-3">
        <h3 className="font-medium text-muted-foreground">
          {format(new Date(date), 'EEEE, MMMM do, yyyy')}
        </h3>
        <Separator className="mt-3" />
      </div>
      <div className="space-y-3">
        {activities.map((activity) => (
          variant === "active" ? (
            <ActivityCard
              key={activity.id}
              id={activity.id}
              type={activity.type}
              scannedAt={activity.scanned_at}
              amount_spent={activity.amount_spent}
              customer_points={activity.customer_points}
              referrer_points={activity.referrer_points}
              restaurant_recruiter_points={activity.restaurant_recruiter_points}
              app_referrer_points={activity.app_referrer_points}
              user={{
                id: activity.user?.id || '',
                first_name: activity.user?.first_name || null,
                last_name: activity.user?.last_name || null,
                photo: activity.user?.photo || null
              }}
              referrer={activity.user_referrer_id ? {
                id: activity.user_referrer_id.id || '',
                first_name: activity.user_referrer_id.first_name || null,
                last_name: activity.user_referrer_id.last_name || null,
                photo: activity.user_referrer_id.photo || null
              } : null}
              scanner={activity.scanner ? {
                id: activity.scanner.id || '',
                first_name: activity.scanner.first_name || null,
                last_name: activity.scanner.last_name || null
              } : null}
              processed_by={activity.processed_by ? {
                id: activity.processed_by.id || '',
                first_name: activity.processed_by.first_name || null,
                last_name: activity.processed_by.last_name || null
              } : null}
              onProcess={() => onUseReferral(activity)}
              buttonText={buttonText}
            />
          ) : (
            <ReferralCard
              key={activity.id}
              referral={activity}
              onUseReferral={() => onUseReferral(activity)}
              buttonText={buttonText}
              variant={variant}
            />
          )
        ))}
      </div>
    </div>
  );
};
