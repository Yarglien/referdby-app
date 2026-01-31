
import { format } from "date-fns";
import { ReferralStatusBadge } from "./ReferralStatusBadge";

interface ReferralCardInfoProps {
  restaurantName: string;
  scannedAt: string | null;
  status: string;
  isInvalidRecentVisit?: boolean;
}

export const ReferralCardInfo = ({ 
  restaurantName, 
  scannedAt, 
  status,
  isInvalidRecentVisit 
}: ReferralCardInfoProps) => {
  const formatScannedTime = (scannedAt: string | null) => {
    if (!scannedAt) return null;
    try {
      return format(new Date(scannedAt), 'PPP');
    } catch (error) {
      console.error('Error formatting date:', error);
      return null;
    }
  };

  return (
    <div>
      <div className="font-semibold text-lg">
        {restaurantName}
      </div>
      <div className="text-sm text-muted-foreground">
        {isInvalidRecentVisit ? (
          <div className="flex flex-col gap-1">
            <ReferralStatusBadge 
              status={status} 
              isInvalidRecentVisit={isInvalidRecentVisit}
            />
            <span className="text-red-600 text-xs">You've visited this restaurant recently</span>
          </div>
        ) : status === 'used' ? (
          <>Processed: {formatScannedTime(scannedAt)}</>
        ) : (
          <>
            {scannedAt && (
              <>Received: {formatScannedTime(scannedAt)}</>
            )}
          </>
        )}
      </div>
    </div>
  );
};
