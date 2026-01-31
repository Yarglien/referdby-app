
import { useRef, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { updateLastUsed } from '@/utils/authCleanup';

export const useAuthActivity = (user: User | null) => {
  const lastActivityRef = useRef<number>(Date.now());
  const lastDbUpdateRef = useRef<number>(0);

  // Track user activity to detect inactivity
  useEffect(() => {
    const updateActivity = () => {
      const now = Date.now();
      lastActivityRef.current = now;
      
      // Only update database every 5 minutes to prevent spam
      const fiveMinutes = 5 * 60 * 1000;
      if (user && (now - lastDbUpdateRef.current) > fiveMinutes) {
        lastDbUpdateRef.current = now;
        updateLastUsed(user.id);
      }
    };

    // Events that indicate user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, [user]);

  return { lastActivityRef };
};
