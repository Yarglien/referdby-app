import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  role: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  current_points: number | null;
  photo: string | null;
  home_currency: string | null;
  restaurant_id: string | null;
  language_preference?: string | null;
  distance_unit?: string | null;
}

interface UserContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
  clearCache: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

const PROFILE_CACHE_KEY = 'user_profile_cache';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

interface CachedProfile {
  profile: UserProfile;
  timestamp: number;
}

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load cached profile from localStorage
  const loadCachedProfile = (): UserProfile | null => {
    try {
      const cached = localStorage.getItem(PROFILE_CACHE_KEY);
      if (cached) {
        const parsedCache: CachedProfile = JSON.parse(cached);
        const now = Date.now();
        
        // Check if cache is still valid (within 30 minutes)
        if (now - parsedCache.timestamp < CACHE_DURATION) {
          console.log('Loading user profile from cache');
          return parsedCache.profile;
        } else {
          console.log('Cached profile expired, removing from storage');
          localStorage.removeItem(PROFILE_CACHE_KEY);
        }
      }
    } catch (error) {
      console.error('Error loading cached profile:', error);
      localStorage.removeItem(PROFILE_CACHE_KEY);
    }
    return null;
  };

  // Save profile to localStorage cache
  const saveProfileToCache = (profileData: UserProfile) => {
    try {
      const cacheData: CachedProfile = {
        profile: profileData,
        timestamp: Date.now()
      };
      localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(cacheData));
      console.log('User profile cached locally');
    } catch (error) {
      console.error('Error caching profile:', error);
    }
  };

  // Fetch profile from database
  const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      console.log('Fetching fresh user profile from database');
      const { data, error } = await supabase
        .from('profiles')
        .select('id, role, first_name, last_name, email, current_points, photo, home_currency, restaurant_id, language_preference, distance_unit')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      if (data) {
        saveProfileToCache(data);
        return data;
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
    return null;
  };

  // Refresh profile data
  const refreshProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    const freshProfile = await fetchProfile(user.id);
    setProfile(freshProfile);
    setIsLoading(false);
  };

  // Clear all cached data
  const clearCache = () => {
    localStorage.removeItem(PROFILE_CACHE_KEY);
    setProfile(null);
    setUser(null);
    setSession(null);
    console.log('User cache cleared completely');
  };

  // Initialize auth state and set up listeners
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        setSession(session);
        setUser(session?.user ?? null);

        if (event === 'SIGNED_IN' && session?.user) {
          // Try to load from cache first, then fetch if needed
          const cachedProfile = loadCachedProfile();
          if (cachedProfile && cachedProfile.id === session.user.id) {
            setProfile(cachedProfile);
            setIsLoading(false);
          } else {
            // Defer database call to prevent auth callback deadlock
            setTimeout(async () => {
              const freshProfile = await fetchProfile(session.user.id);
              setProfile(freshProfile);
              setIsLoading(false);
            }, 0);
          }
        } else if (event === 'SIGNED_OUT') {
          clearCache();
          setIsLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Try cache first
        const cachedProfile = loadCachedProfile();
        if (cachedProfile && cachedProfile.id === session.user.id) {
          setProfile(cachedProfile);
          setIsLoading(false);
        } else {
          // Fetch fresh data
          fetchProfile(session.user.id).then(freshProfile => {
            setProfile(freshProfile);
            setIsLoading(false);
          });
        }
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Clear cache when user changes (prevents cross-user contamination)
  useEffect(() => {
    if (user && profile && user.id !== profile.id) {
      console.log('User changed, clearing cache');
      clearCache();
    }
  }, [user, profile]);

  const value: UserContextType = {
    user,
    session,
    profile,
    isLoading,
    refreshProfile,
    clearCache
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};