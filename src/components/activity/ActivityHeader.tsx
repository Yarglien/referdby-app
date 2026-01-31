import React from "react";
import { useTranslation } from "react-i18next";

interface ActivityHeaderProps {
  role?: string;
  currentPoints?: number;
  restaurantPoints?: number;
}

export const ActivityHeader = ({ role, currentPoints, restaurantPoints }: ActivityHeaderProps) => {
  const { t } = useTranslation();
  
  return (
    <header className="p-4 border-b border-border">
      <h1 className="text-2xl font-bold text-primary">
        {role === 'restaurant_manager' ? t('activity.restaurantActivity') : t('activity.yourActivity')}
      </h1>
      <p className="text-muted-foreground mt-1">
        {role === 'restaurant_manager' 
          ? t('activity.restaurantPoints', { points: restaurantPoints || '0' })
          : t('activity.currentPoints', { points: currentPoints || '0' })
        }
      </p>
    </header>
  );
};