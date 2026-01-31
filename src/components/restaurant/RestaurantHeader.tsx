import { Utensils } from "lucide-react";
import { useTranslation } from 'react-i18next';

interface RestaurantHeaderProps {
  restaurantPhoto?: string;
  restaurantName?: string;
}

export const RestaurantHeader = ({ restaurantPhoto, restaurantName }: RestaurantHeaderProps) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      {restaurantPhoto ? (
        <div className="w-full max-w-md h-32 rounded-lg overflow-hidden mx-auto">
          <img 
            src={restaurantPhoto} 
            alt={restaurantName}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
              console.error('Error loading restaurant image');
            }}
          />
        </div>
      ) : (
        <div className="w-full max-w-md h-32 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
          <Utensils className="w-16 h-16 text-primary" />
        </div>
      )}
      {restaurantName ? (
        <h2 className="text-xl font-semibold">{restaurantName}</h2>
      ) : (
        <p className="text-muted-foreground">{t('restaurant.noRestaurantConfigured')}</p>
      )}
    </div>
  );
};