
import { Wifi, Car, Accessibility, CreditCard, Umbrella, Users, Leaf, Apple, Ban, Calendar, Truck, Box, Dice6 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useTranslation } from 'react-i18next';

interface AmenitiesListProps {
  amenities: {
    [key: string]: string;
  };
  onAmenityChange: (id: string, value: string) => void;
}

const getAmenityItems = (t: any) => [
  { id: "has_wifi", label: t('restaurant.amenitiesOptions.wifi'), icon: Wifi },
  { id: "has_parking", label: t('restaurant.amenitiesOptions.parking'), icon: Car },
  { id: "is_wheelchair_accessible", label: t('restaurant.amenitiesOptions.wheelchairAccessible'), icon: Accessibility },
  { id: "accepts_credit_cards", label: t('restaurant.amenitiesOptions.creditCards'), icon: CreditCard },
  { id: "has_outdoor_seating", label: t('restaurant.amenitiesOptions.outdoorSeating'), icon: Umbrella },
  { id: "is_family_friendly", label: t('restaurant.amenitiesOptions.familyFriendly'), icon: Users },
  { id: "has_vegetarian_options", label: t('restaurant.amenitiesOptions.vegetarianOptions'), icon: Leaf },
  { id: "has_vegan_options", label: t('restaurant.amenitiesOptions.veganOptions'), icon: Apple },
  { id: "has_gluten_free_options", label: t('restaurant.amenitiesOptions.glutenFreeOptions'), icon: Ban },
  { id: "accepts_reservations", label: t('restaurant.amenitiesOptions.reservations'), icon: Calendar },
  { id: "has_delivery", label: t('restaurant.amenitiesOptions.delivery'), icon: Truck },
  { id: "has_takeout", label: t('restaurant.amenitiesOptions.takeout'), icon: Box },
  { id: "has_roll_meal_offer", label: t('restaurant.amenitiesOptions.rollMealOffer'), icon: Dice6 }
];

export const AmenitiesList = ({ amenities, onAmenityChange }: AmenitiesListProps) => {
  const { t } = useTranslation();
  const amenityItems = getAmenityItems(t);
  
  return (
    <div className="space-y-6">
      {amenityItems.map(({ id, label, icon: Icon }) => (
        <div key={id} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </div>
          <RadioGroup
            value={amenities[id]}
            onValueChange={(value) => onAmenityChange(id, value)}
            className="flex items-center gap-4"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="yes" id={`${id}-yes`} />
              <Label htmlFor={`${id}-yes`}>{t('restaurant.amenitiesOptions.yes')}</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="no" id={`${id}-no`} />
              <Label htmlFor={`${id}-no`}>{t('restaurant.amenitiesOptions.no')}</Label>
            </div>
          </RadioGroup>
        </div>
      ))}
    </div>
  );
};
