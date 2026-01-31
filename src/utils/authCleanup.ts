
import { supabase } from "@/integrations/supabase/client";

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

export const isSessionExpired = (lastUsed: string | null): boolean => {
  if (!lastUsed) return true;
  
  const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
  const lastUsedDate = new Date(lastUsed);
  
  return lastUsedDate < fourHoursAgo;
};

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
