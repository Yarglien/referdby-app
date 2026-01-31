
import { useRef, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

interface UseInactivityCheckProps {
  user: User | null;
  lastActivityRef: React.MutableRefObject<number>;
  justLoggedInRef: React.MutableRefObject<boolean>;
  handleSignOut: () => Promise<void>;
}

export const useInactivityCheck = ({
  user,
  lastActivityRef,
  justLoggedInRef,
  handleSignOut
}: UseInactivityCheckProps) => {
  const { toast } = useToast();
  const activityCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check for inactivity every minute, but not immediately after login
  useEffect(() => {
    if (user) {
      activityCheckIntervalRef.current = setInterval(() => {
        // Don't check inactivity if user just logged in (give them 3 hours grace period)
        if (justLoggedInRef.current) {
          return;
        }

        const fourHoursAgo = Date.now() - 4 * 60 * 60 * 1000;
        
        if (lastActivityRef.current < fourHoursAgo) {
          console.log('User inactive for 4+ hours, forcing logout');
          toast({
            title: "Session Expired",
            description: "You've been logged out due to inactivity",
            variant: "destructive",
          });
          handleSignOut();
        }
      }, 60000); // Check every minute

      return () => {
        if (activityCheckIntervalRef.current) {
          clearInterval(activityCheckIntervalRef.current);
        }
      };
    }
  }, [user, toast, lastActivityRef, justLoggedInRef, handleSignOut]);

  return { activityCheckIntervalRef };
};
