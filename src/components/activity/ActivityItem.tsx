
import React from "react";
import { format } from "date-fns";
import { Activity } from "@/integrations/supabase/types/activity.types";
import { cn } from "@/lib/utils";
import { formatPointValue } from "@/utils/activityUtils";
import { ActivityType as ActivityTypeEnum } from "@/integrations/supabase/types/enums.types";
import { getCurrencySymbol } from "@/utils/currencyUtils";

interface PointValue {
  label: string;
  value: number;
}

interface ActivityItemProps {
  activity: Activity;
  getActivityTitle: (activity: Activity) => string;
  getPointsValues: (activity: Activity) => PointValue[];
  variant?: "default" | "restaurant";
  userHomeCurrency?: string;
}

export const ActivityItem = ({
  activity,
  getActivityTitle,
  getPointsValues,
  variant = "default",
  userHomeCurrency = "USD"
}: ActivityItemProps) => {
  const title = getActivityTitle(activity);
  if (!title) return null;

  const points = getPointsValues(activity);
  const isRollActivity = activity.activity_type === 'roll_token_processed' || 
                        activity.activity_type === 'roll_token_generated';
  
  const restaurantName = activity.restaurant?.name || '';
  const time = format(new Date(activity.created_at), "HH:mm");
  
  // Show bill total in restaurant's currency (as it appears on receipt)
  const restaurantCurrency = activity.restaurant?.currency || 'USD';
  const billTotal = activity.amount_spent 
    ? `${getCurrencySymbol(restaurantCurrency)}${activity.amount_spent.toFixed(2)}`
    : null;

  // Debug logging to verify currency handling
  if (activity.amount_spent && restaurantCurrency !== 'USD') {
    console.log('Currency conversion debug:', {
      activityId: activity.id,
      billAmount: activity.amount_spent,
      restaurantCurrency,
      userHomeCurrency,
      displayAmount: billTotal,
      pointsCalculated: points
    });
  }

  if (variant === "restaurant") {
    return (
      <div className="p-4 flex items-center justify-between hover:bg-accent/5 transition-colors">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">{time}</span>
          <span className="font-medium">{title}</span>
          <span className="text-sm text-muted-foreground">
            Customer: {activity.user ? `${activity.user.first_name} ${activity.user.last_name}`.trim() : 'Unknown Customer'}
          </span>
          {activity.processed_by && (
            <span className="text-sm text-muted-foreground">
              Processed by: {`${activity.processed_by.first_name} ${activity.processed_by.last_name}`.trim()}
            </span>
          )}
          {(activity.amount_spent || isRollActivity) && (
            <span className="text-sm text-muted-foreground">
              Bill Total: {billTotal || 'N/A'} 
              {restaurantCurrency !== 'USD' && (
                <span className="text-xs opacity-70 ml-1">({restaurantCurrency})</span>
              )}
            </span>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {points.map((point, index) => (
            <span
              key={index}
              className={cn(
                "font-medium text-base",
                point.value >= 0 ? "text-green-500" : "text-red-500"
              )}
            >
              {formatPointValue(point.value)}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:border-gray-200 transition-colors">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">{time}</div>
          <div className="font-semibold text-gray-900">{title}</div>
          {restaurantName && !title.includes(restaurantName) && (
            <div className="text-sm text-muted-foreground">
              {restaurantName}
            </div>
          )}
          {billTotal && (
            <div className="text-sm text-muted-foreground">
              Bill Total: {billTotal}
              {restaurantCurrency !== 'USD' && (
                <span className="text-xs opacity-70 ml-1">({restaurantCurrency})</span>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {points.map((point, index) => (
            <span 
              key={index}
              className={cn(
                "font-semibold text-base",
                point.value >= 0 ? "text-green-500" : "text-red-500"
              )}
            >
              {formatPointValue(point.value)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
