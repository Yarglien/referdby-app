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

const GRACE_PERIOD_MS = 5 * 60 * 1000; // 5 minutes - skip all checks after user becomes active
const CHECK_INTERVAL_MS = 60 * 1000; // 1 minute

const ENABLE_INACTIVITY_CHECK = true;

export const useInactivityCheck = ({
  user,
  lastActivityRef,
  justLoggedInRef,
  handleSignOut
}: UseInactivityCheckProps) => {
  const { toast } = useToast();
  const activityCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initialDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userActiveSinceRef = useRef<number>(0);

  useEffect(() => {
    if (user) {
      userActiveSinceRef.current = Date.now();
    }
  }, [user]);

  // Check for inactivity every minute, with 2-min delay before first check (prevents sign-out-after-login)
  useEffect(() => {
    if (user && ENABLE_INACTIVITY_CHECK) {
      const runCheck = async () => {
        // Skip all checks for 5 min after user becomes active (prevents sign-out-after-login bug)
        if (Date.now() - userActiveSinceRef.current < GRACE_PERIOD_MS) {
          return;
        }
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
      };

      // Wait 2 minutes before first check, then run every minute
      initialDelayRef.current = setTimeout(() => {
        runCheck();
        activityCheckIntervalRef.current = setInterval(runCheck, CHECK_INTERVAL_MS);
      }, 2 * 60 * 1000);

      return () => {
        if (initialDelayRef.current) {
          clearTimeout(initialDelayRef.current);
          initialDelayRef.current = null;
        }
        if (activityCheckIntervalRef.current) {
          clearInterval(activityCheckIntervalRef.current);
          activityCheckIntervalRef.current = null;
        }
      };
    }
  }, [user, toast, lastActivityRef, justLoggedInRef, handleSignOut]);

  return { activityCheckIntervalRef };
};
