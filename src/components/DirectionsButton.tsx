import { Button } from "@/components/ui/button";
import { MapPin, CornerUpRight } from "lucide-react";
import { openDirections } from "@/utils/directionsUtils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DirectionsButtonProps {
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  name?: string;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showLabel?: boolean;
  onShowLocation?: () => void;
}

export const DirectionsButton = ({
  address,
  latitude,
  longitude,
  name,
  variant = "ghost",
  size = "icon",
  className,
  showLabel = false,
  onShowLocation,
}: DirectionsButtonProps) => {
  const handleDirectionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openDirections(address, latitude, longitude, name);
  };

  const handleLocationClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShowLocation) {
      onShowLocation();
    }
  };

  if (showLabel) {
    return (
      <div className="flex items-center gap-1">
        {onShowLocation && (
          <Button
            variant={variant}
            size="sm"
            className={className}
            onClick={handleLocationClick}
          >
            <MapPin className="h-4 w-4 mr-2" />
            Location
          </Button>
        )}
        <Button
          variant={variant}
          size="sm"
          className={className}
          onClick={handleDirectionsClick}
        >
          <CornerUpRight className="h-4 w-4 mr-2" />
          Directions
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-0.5">
        {onShowLocation && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={variant}
                size={size}
                className={className}
                onClick={handleLocationClick}
                aria-label="Show location"
              >
                <MapPin className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Show location</p>
            </TooltipContent>
          </Tooltip>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={variant}
              size={size}
              className={className}
              onClick={handleDirectionsClick}
              aria-label="Get directions in Maps"
            >
              <CornerUpRight className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Get directions</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};
