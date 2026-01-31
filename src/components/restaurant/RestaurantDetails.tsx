import { Link } from "react-router-dom";
import { formatPointsForDisplay } from "@/utils/pointsCalculator";

interface RestaurantDetailsProps {
  id: string;
  name: string;
  cuisine_type: string;
  current_points?: string | null;
  address?: string;
}

export const RestaurantDetails = ({ 
  id, 
  name, 
  cuisine_type, 
  current_points,
  address 
}: RestaurantDetailsProps) => {
  return (
    <div>
      <Link 
        to={`/restaurant-listing/${id}`}
        className="hover:text-primary transition-colors"
      >
        <h3 className="font-medium">{name}</h3>
      </Link>
      <p className="text-sm text-muted-foreground">{cuisine_type}</p>
      {address && (
        <p className="text-sm text-muted-foreground">{address}</p>
      )}
    </div>
  );
};