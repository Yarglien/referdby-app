
import { supabase } from "@/integrations/supabase/client";

/** Hash refresh token for single-session storage (never store raw tokens) */
export const hashSessionToken = async (refreshToken: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(refreshToken);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};

/** Update the active session token for single-session enforcement */
export const updateCurrentSessionToken = async (userId: string, refreshToken: string) => {
  try {
    const tokenHash = await hashSessionToken(refreshToken);
    await supabase
      .from('profiles')
      .update({ current_session_token: tokenHash })
      .eq('id', userId);
  } catch (error) {
    console.error('Error updating current_session_token:', error);
  }
};

/** Check if this session is still the active one (user hasn't logged in elsewhere) */
export const isCurrentSessionValid = async (
  userId: string,
  refreshToken: string
): Promise<boolean> => {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('current_session_token')
      .eq('id', userId)
      .single();

    if (!profile?.current_session_token) return true; // No stored token = first login, allow
    const ourHash = await hashSessionToken(refreshToken);
    return profile.current_session_token === ourHash;
  } catch {
    return false;
  }
};

export const cleanupAuthState = () => {
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Remove from sessionStorage if in use
  if (typeof sessionStorage !== 'undefined') {
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  }

  // Clear any additional auth-related data
  localStorage.removeItem('supabase.auth.token');
  localStorage.removeItem('hasSeenCarousel');
  localStorage.removeItem('hasSeenManagerCarousel');
  
  // Clear user profile cache - CRITICAL for security
  localStorage.removeItem('user_profile_cache');
  
  // Clear password recovery state - prevents showing reset form after logout
  sessionStorage.removeItem('password_recovery_mode');
  
  console.log('All auth state and user cache cleared');
};

const INACTIVITY_HOURS = 5;

export const isSessionExpired = (lastUsed: string | null): boolean => {
  if (!lastUsed) return true;
  
  const inactivityThreshold = new Date(Date.now() - INACTIVITY_HOURS * 60 * 60 * 1000);
  const lastUsedDate = new Date(lastUsed);
  
  return lastUsedDate < inactivityThreshold;
};

export const getInactivityThresholdMs = () => INACTIVITY_HOURS * 60 * 60 * 1000;

export const updateLastUsed = async (userId: string) => {
  try {
    await supabase
      .from('profiles')
      .update({ last_used: new Date().toISOString() })
      .eq('id', userId);
  } catch (error) {
    console.error('Error updating last_used:', error);
  }
};
