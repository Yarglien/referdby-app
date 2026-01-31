
import { Activity } from "@/integrations/supabase/types/activity.types";
import { format } from "date-fns";

interface ActivityItemProps {
  activity: Activity;
  getActivityTitle: (activity: Activity) => string;
  getPointsValue: (activity: Activity) => { value: number; isPositive: boolean };
}

export const ActivityItem = ({ activity, getActivityTitle, getPointsValue }: ActivityItemProps) => {
  // Skip referral_presented activities
  if (activity.type === 'referral_presented') return null;
  
  const points = getPointsValue(activity);
  
  return (
    <div key={activity.id} className="p-4 flex items-center justify-between">
      <div className="flex flex-col">
        <span className="text-sm text-muted-foreground">
          {format(new Date(activity.created_at), "HH:mm")}
        </span>
        <span className="font-medium">
          {getActivityTitle(activity)}
        </span>
        {activity.user && (
          <span className="text-sm text-muted-foreground">
            Customer: {activity.user.first_name} {activity.user.last_name || activity.user.name}
          </span>
        )}
        
        {/* For Roll Token, show Win/Lose and bill amount */}
        {activity.activity_type === 'roll_token_processed' && (
          <span className="text-sm text-muted-foreground">
            {activity.amount_spent > 0 ? 'Lost' : 'Won'} • 
            Bill Amount: ${Math.abs(activity.amount_spent || 0).toFixed(2)}
          </span>
        )}
        
        {/* For regular meal purchases */}
        {activity.amount_spent && activity.activity_type !== 'roll_token_processed' && (
          <span className="text-sm text-muted-foreground">
            Bill Amount: ${activity.amount_spent.toFixed(2)}
          </span>
        )}
        
        {/* For points redemption, show points redeemed */}
        {activity.type === 'redeem_processed' && activity.points_redeemed > 0 && (
          <span className="text-sm text-muted-foreground">
            Points Redeemed: {activity.points_redeemed}
          </span>
        )}
        
        {activity.processed_by && (
          <span className="text-sm text-muted-foreground">
            Processed by: {activity.processed_by.first_name} {activity.processed_by.last_name}
          </span>
        )}
      </div>
      <span className={`font-medium ${points.isPositive ? 'text-green-500' : 'text-red-500'}`}>
        {points.isPositive ? `+${points.value}` : `-${points.value}`}
      </span>
    </div>
  );
};
