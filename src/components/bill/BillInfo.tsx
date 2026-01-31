
import { getCurrencySymbol } from "@/utils/currencyUtils";
import { Separator } from "@/components/ui/separator";

interface BillInfoProps {
  currentUser: any;
  activityData: any;
}

export const BillInfo = ({ currentUser, activityData }: BillInfoProps) => {
  // Use restaurant currency for bill entry since that's the currency the bill is in
  const restaurantCurrency = activityData?.restaurant?.currency || 'USD';
  const currencySymbol = getCurrencySymbol(restaurantCurrency);
  
  // Debug logging to help identify the issue
  console.log('BillInfo - activityData:', activityData);
  console.log('BillInfo - restaurant data:', activityData?.restaurant);
  console.log('BillInfo - restaurant currency:', activityData?.restaurant?.currency);
  console.log('BillInfo - resolved currency:', restaurantCurrency);
  
  return (
    <div className="space-y-3">
      <div className="flex">
        <span className="text-muted-foreground w-32">Server:</span>
        <span className="font-medium">{currentUser?.first_name} {currentUser?.last_name}</span>
      </div>
      <div className="flex">
        <span className="text-muted-foreground w-32">Restaurant:</span>
        <span className="font-medium">{activityData?.restaurant?.name}</span>
      </div>
      <div className="flex">
        <span className="text-muted-foreground w-32">Customer:</span>
        <span className="font-medium">{activityData?.user?.first_name} {activityData?.user?.last_name}</span>
      </div>
      <div className="flex">
        <span className="text-muted-foreground w-32">Available Points:</span>
        <span className="font-medium">{activityData?.user?.current_points || 0}</span>
      </div>
      
      <Separator className="my-4" />
      
      <div className="flex">
        <span className="text-muted-foreground w-32">Scanned by:</span>
        <span className="font-medium">{activityData?.scanner?.first_name} {activityData?.scanner?.last_name}</span>
      </div>
      <div className="flex">
        <span className="text-muted-foreground w-32">Restaurant Currency:</span>
        <span className="font-medium">{restaurantCurrency} {currencySymbol}</span>
      </div>
    </div>
  );
};
