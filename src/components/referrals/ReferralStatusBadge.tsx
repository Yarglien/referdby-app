import { cn } from "@/lib/utils";

interface ReferralStatusBadgeProps {
  status: string;
  className?: string;
  isInvalidRecentVisit?: boolean;
}

export const ReferralStatusBadge = ({ status, className, isInvalidRecentVisit }: ReferralStatusBadgeProps) => {
  const getStatusColor = () => {
    if (isInvalidRecentVisit) {
      return 'text-red-600';
    }
    
    switch (status) {
      case 'scanned':
        return 'text-blue-600';
      case 'presented':
        return 'text-yellow-600';
      case 'used':
        return 'text-green-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusText = () => {
    if (isInvalidRecentVisit) {
      return 'Invalid - Recent Visit';
    }
    
    switch (status) {
      case 'scanned':
        return 'Ready to Use';
      case 'presented':
        return 'Presented - Pending Processing';
      case 'used':
        return 'Processed';
      default:
        return status;
    }
  };

  return (
    <div className={cn("text-sm", getStatusColor(), className)}>
      {getStatusText()}
    </div>
  );
};