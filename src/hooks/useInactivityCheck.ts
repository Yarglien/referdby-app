import { useRef, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getInactivityThresholdMs, isCurrentSessionValid, isSessionExpired } from '@/utils/authCleanup';

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
      activityCheckIntervalRef.current = setInterval(async () => {
        // Don't check inactivity if user just logged in (give them 30 min grace period)
        if (justLoggedInRef.current) {
          return;
        }

        // Single-session: check if user logged in elsewhere
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id && session.refresh_token) {
          const sessionValid = await isCurrentSessionValid(session.user.id, session.refresh_token);
          if (!sessionValid) {
            toast({
              title: "Logged in elsewhere",
              description: "You've been signed out because you logged in on another device",
              variant: "destructive",
            });
            handleSignOut();
            return;
          }
        }

        // Check DB last_used for 5+ hours inactivity (e.g. returned after long absence)
        if (session?.user?.id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('last_used')
            .eq('id', session.user.id)
            .single();
          if (profile?.last_used && isSessionExpired(profile.last_used)) {
            toast({
              title: "Session Expired",
              description: "You've been logged out due to inactivity",
              variant: "destructive",
            });
            handleSignOut();
            return;
          }
        }

        const inactivityThreshold = Date.now() - getInactivityThresholdMs();
        
        if (lastActivityRef.current < inactivityThreshold) {
          console.log('User inactive for 5+ hours, forcing logout');
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
