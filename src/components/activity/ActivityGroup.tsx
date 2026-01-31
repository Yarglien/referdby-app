
import React from "react";
import { format } from "date-fns";
import { Activity } from "@/integrations/supabase/types/activity.types";
import { ActivityItem } from "./ActivityItem";
import { Card } from "@/components/ui/card";

interface PointValue {
  label: string;
  value: number;
}

interface ActivityGroupProps {
  date: string;
  activities: Activity[];
  getActivityTitle: (activity: Activity) => string;
  getPointsValues: (activity: Activity) => PointValue[];
  variant?: "default" | "restaurant";
  userHomeCurrency?: string;
}

export const ActivityGroup = ({
  date,
  activities,
  getActivityTitle,
  getPointsValues,
  variant = "default",
  userHomeCurrency = "USD"
}: ActivityGroupProps) => {
  const containerClasses = variant === "restaurant" 
    ? "space-y-3"
    : "space-y-4";

  const titleClasses = variant === "restaurant"
    ? "text-lg font-medium text-primary"
    : "text-lg font-semibold text-primary";

  const activitiesContainerClasses = variant === "restaurant"
    ? "divide-y divide-border"
    : "space-y-4";

  return (
    <div className={containerClasses}>
      <h2 className={titleClasses}>
        {format(new Date(date), "MMMM d, yyyy")}
      </h2>
      <div className={activitiesContainerClasses}>
        {variant === "restaurant" ? (
          <Card>
            {activities.map((activity) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                getActivityTitle={getActivityTitle}
                getPointsValues={getPointsValues}
                variant={variant}
                userHomeCurrency={userHomeCurrency}
              />
            ))}
          </Card>
        ) : (
          activities.map((activity) => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              getActivityTitle={getActivityTitle}
              getPointsValues={getPointsValues}
              variant={variant}
              userHomeCurrency={userHomeCurrency}
            />
          ))
        )}
      </div>
    </div>
  );
};
