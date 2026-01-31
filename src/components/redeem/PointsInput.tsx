
import { Input } from "@/components/ui/input";

interface PointsInputProps {
  pointsToRedeem: string;
  maxRedemptionPercentage: number;
  maxUserPoints: number;
  onPointsChange: (value: string) => void;
  maxRedemptionWarning: string | null;
}

export const PointsInput = ({ 
  pointsToRedeem, 
  maxRedemptionPercentage, 
  maxUserPoints, 
  onPointsChange, 
  maxRedemptionWarning 
}: PointsInputProps) => {
  return (
    <div className="space-y-2">
      <label className="text-primary">
        How many points does the customer wish to redeem today?
        {maxRedemptionPercentage < 100 && (
          <span className="text-sm block text-muted-foreground">
            (This restaurant allows up to {maxRedemptionPercentage}% of the bill to be paid with points)
          </span>
        )}
      </label>
      <Input
        type="number"
        min="0"
        max={maxUserPoints}
        value={pointsToRedeem}
        onChange={(e) => onPointsChange(e.target.value)}
        placeholder="0"
        className="text-xl"
      />
      {maxRedemptionWarning && (
        <div className="text-red-500 text-sm mt-1">{maxRedemptionWarning}</div>
      )}
    </div>
  );
};
