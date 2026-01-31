
import React from "react";
import { Activity } from "@/integrations/supabase/types/activity.types";
import { ActivityGroup } from "./ActivityGroup";
import { useTranslation } from 'react-i18next';

interface PointValue {
  label: string;
  value: number;
}

interface ActivityListProps {
  groupedActivities: Record<string, Activity[]>;
  getActivityTitle: (activity: Activity) => string;
  getPointsValues: (activity: Activity) => PointValue[];
  variant?: "default" | "restaurant";
  userHomeCurrency?: string;
}

export const ActivityList = ({ 
  groupedActivities,
  getActivityTitle,
  getPointsValues,
  variant = "default",
  userHomeCurrency = "USD"
}: ActivityListProps) => {
  const { t } = useTranslation();
  
  if (Object.keys(groupedActivities).length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">{t('activity.noActivityYet')}</p>
        <p className="text-sm text-muted-foreground mt-2">
          {t('activity.pointsActivityAppearHere')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(groupedActivities).map(([date, dateActivities]) => (
        <ActivityGroup
          key={date}
          date={date}
          activities={dateActivities}
          getActivityTitle={getActivityTitle}
          getPointsValues={getPointsValues}
          variant={variant}
          userHomeCurrency={userHomeCurrency}
        />
      ))}
    </div>
  );
};
