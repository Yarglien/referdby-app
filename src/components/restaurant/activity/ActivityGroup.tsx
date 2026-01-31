
import { Activity } from "@/integrations/supabase/types/activity.types";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { ActivityItem } from "./ActivityItem";

interface ActivityGroupProps {
  date: string;
  activities: Activity[];
  getActivityTitle: (activity: Activity) => string;
  getPointsValue: (activity: Activity) => { value: number; isPositive: boolean };
}

export const ActivityGroup = ({ date, activities, getActivityTitle, getPointsValue }: ActivityGroupProps) => {
  // Filter out referral_presented activities
  const filteredActivities = activities.filter(activity => activity.type !== 'referral_presented');
  
  if (filteredActivities.length === 0) return null;
  
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-medium text-primary">
        {format(new Date(date), "MMMM d, yyyy")}
      </h2>
      <Card className="divide-y divide-border">
        {filteredActivities.map((activity) => (
          <ActivityItem
            key={activity.id}
            activity={activity}
            getActivityTitle={getActivityTitle}
            getPointsValue={getPointsValue}
          />
        ))}
      </Card>
    </div>
  );
};
