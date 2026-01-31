
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { parseNumber, calculateMaxRedeemablePoints } from "@/utils/redemption/validators";

interface RedemptionCalculatorProps {
  billTotal: string;
  pointsToRedeem: string;
  maxRedemptionPercentage: number;
  maxRedemptionWarning: string | null;
  userPoints: number;
}

export const RedemptionCalculator = ({
  billTotal,
  pointsToRedeem,
  maxRedemptionPercentage,
  maxRedemptionWarning,
  userPoints
}: RedemptionCalculatorProps) => {
  const billAmount = parseNumber(billTotal);
  const points = parseNumber(pointsToRedeem);

  return (
    <>
      {maxRedemptionWarning && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{maxRedemptionWarning}</AlertDescription>
        </Alert>
      )}

      {billTotal && pointsToRedeem && (
        <div className="p-4 bg-secondary/10 rounded-lg">
          <p className="text-lg font-semibold">
            New Bill Total: ${Math.max(0, parseNumber(billTotal) - parseNumber(pointsToRedeem)).toFixed(2)}
          </p>
          {parseNumber(billTotal) > 0 && (
            <p className="text-sm text-muted-foreground">
              Maximum points redeemable: {calculateMaxRedeemablePoints(
                parseNumber(billTotal), 
                maxRedemptionPercentage
              )}
            </p>
          )}
        </div>
      )}
    </>
  );
};
