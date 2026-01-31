
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useUser } from '@/contexts/UserContext';
import { formatDistance } from '@/utils/mapUtils';

interface RestaurantLocationProps {
  address: string;
  distance: number; // Always in miles from the hook
  referral_count: number;
  return_rate?: number | null;
}

export const RestaurantLocation = memo(({
  address,
  distance,
  return_rate,
}: RestaurantLocationProps) => {
  const { t } = useTranslation();
  const { profile } = useUser();
  
  const distanceUnit = profile?.distance_unit || 'miles';
  const formattedDistance = formatDistance(distance, distanceUnit);
  
  return (
    <div className="text-sm text-muted-foreground">
      <div>{address}</div>
      <div className="flex justify-between items-center">
        <span>{formattedDistance}</span>
        {return_rate !== null && return_rate !== undefined && (
          <span className="text-primary font-medium">
            {t('restaurant.returnRate', { rate: return_rate })}
          </span>
        )}
      </div>
    </div>
  );
});

RestaurantLocation.displayName = 'RestaurantLocation';
