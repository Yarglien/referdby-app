import { useRef, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  cleanupAuthState,
  isCurrentSessionValid,
  isSessionExpired,
  updateCurrentSessionToken,
  updateLastUsed,
} from '@/utils/authCleanup';
import { useQueryClient } from '@tanstack/react-query';

export const useAuthSession = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
  const justLoggedInRef = useRef<boolean>(false);

  const handleSignOut = async () => {
    console.log('=== HANDLE SIGN OUT CALLED ===');
    try {
      console.log('Cleaning up auth state...');
      cleanupAuthState();
      console.log('Clearing React Query cache...');
      queryClient.clear();
      console.log('Setting user to null...');
      setUser(null);
      console.log('Calling supabase.auth.signOut()...');
      
      // Use a timeout to prevent hanging
      const signOutPromise = supabase.auth.signOut();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Sign out timeout')), 5000)
      );
      
      try {
        await Promise.race([signOutPromise, timeoutPromise]);
        console.log('Supabase sign out completed');
      } catch (error) {
        console.warn('Sign out failed or timed out, proceeding with navigation:', error);
      }
      
      console.log('Navigating to /auth...');
      window.location.href = '/auth'; // Force page reload to ensure clean state
      console.log('=== SIGN OUT COMPLETED ===');
    } catch (error) {
      console.error('Error during sign out:', error);
      // Force navigation even if everything fails
      cleanupAuthState();
      queryClient.clear();
      setUser(null);
      window.location.href = '/auth';
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Clean up any existing subscription
        if (subscriptionRef.current) {
          subscriptionRef.current.unsubscribe();
          subscriptionRef.current = null;
        }

        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          navigate('/auth');
          return;
        }

        // Check if session exists
        if (session?.user) {
          // Single-session: user can only be logged in on one device at a time
          if (session.refresh_token) {
            const sessionValid = await isCurrentSessionValid(session.user.id, session.refresh_token);
            if (!sessionValid) {
              console.log('Session invalid - user logged in elsewhere, signing out');
              toast({
                title: "Logged in elsewhere",
                description: "You've been signed out because you logged in on another device",
                variant: "destructive",
              });
              await handleSignOut();
              return;
            }
          }

          // Check if user has been inactive for 5+ hours (e.g. returned to computer after long absence)
          const { data: profile } = await supabase
            .from('profiles')
            .select('last_used')
            .eq('id', session.user.id)
            .single();

          if (profile?.last_used && isSessionExpired(profile.last_used)) {
            console.log('Session expired due to 5+ hours inactivity, signing out');
            toast({
              title: "Session Expired",
              description: "You've been logged out due to inactivity",
              variant: "destructive",
            });
            await handleSignOut();
            return;
          }

          setUser(session.user);
          
          // Update last used timestamp
          await updateLastUsed(session.user.id);
        } else {
          // No session - redirect to auth unless on public pages
          const publicPaths = ['/auth', '/signup', '/referral-auth', '/reset-password', '/direct-signup'];
          const isPublicPath = publicPaths.some((p) => location.pathname === p || location.pathname.startsWith(p + '/'));
          if (!isPublicPath) {
            navigate('/auth');
          }
        }

        // Set up auth state change subscription
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('Auth state changed:', event);
          
          if (event === 'SIGNED_IN' && session?.user) {
            // Check if this is a password recovery flow - don't redirect if so
            const urlParams = new URLSearchParams(window.location.search);
            const isPasswordRecovery = urlParams.get('view') === 'update_password' ||
                                      window.location.hash.includes('type=recovery') ||
                                      window.location.search.includes('type=recovery');
            
            console.log('SIGNED_IN event - Password recovery check:', { 
              isPasswordRecovery, 
              view: urlParams.get('view'),
              hash: window.location.hash,
              search: window.location.search 
            });
            
            // Clear all cached data to prevent cross-user contamination
            queryClient.clear();
            
            // Single-session: update active session token so other devices get signed out
            if (session.refresh_token) {
              await updateCurrentSessionToken(session.user.id, session.refresh_token);
            }
            
            // Mark that user just logged in
            justLoggedInRef.current = true;
            
            // Clear the "just logged in" flag after 30 minutes to allow inactivity checks
            setTimeout(() => {
              justLoggedInRef.current = false;
            }, 30 * 60 * 1000);

            // Update last used on sign in
            await updateLastUsed(session.user.id);
            setUser(session.user);
            
            // Only navigate to home if not a password recovery flow
            if (!isPasswordRecovery) {
              navigate('/');
            }
          } else if (event === 'SIGNED_OUT' || !session) {
            justLoggedInRef.current = false;
            cleanupAuthState();
            // Clear cache on sign out too
            queryClient.clear();
            setUser(null);
            navigate('/auth');
          } else if (event === 'TOKEN_REFRESHED' && session?.user) {
            // Single-session: verify we're still the active device & update our token
            if (session.refresh_token) {
              const sessionValid = await isCurrentSessionValid(session.user.id, session.refresh_token);
              if (!sessionValid) {
                toast({
                  title: "Logged in elsewhere",
                  description: "You've been signed out because you logged in on another device",
                  variant: "destructive",
                });
                await handleSignOut();
                return;
              }
              await updateCurrentSessionToken(session.user.id, session.refresh_token);
            }
            await updateLastUsed(session.user.id);
            setUser(session.user);
          }
        });

        subscriptionRef.current = subscription;
      } catch (error: any) {
        console.error('Auth initialization error:', error);
        toast({
          title: "Authentication Error",
          description: "Please log in again",
          variant: "destructive",
        });
        navigate('/auth');
      }
    };

    initializeAuth();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [navigate, toast, queryClient]);

  return {
    user,
    justLoggedInRef,
    handleSignOut
  };
};