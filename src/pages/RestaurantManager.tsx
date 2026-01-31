
import { DualRoleNavigation } from "@/components/DualRoleNavigation";
import { ViewModeSelector } from "@/components/ViewModeSelector";
import { RestaurantHeader } from "@/components/restaurant/RestaurantHeader";
import { RestaurantActions } from "@/components/restaurant/RestaurantActions";
import { OnboardingCarousel } from "@/components/restaurant/onboarding/OnboardingCarousel";
import { WelcomeHeader } from "@/components/home/WelcomeHeader";
import { ProfilePoints } from "@/components/home/ProfilePoints";
import { MenuGrid } from "@/components/home/MenuGrid";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useViewMode } from "@/contexts/ViewModeContext";
import { toast } from "sonner";
import { useState, useEffect, useMemo } from "react";
import { useTranslation } from 'react-i18next';

const RestaurantManager = () => {
  const navigate = useNavigate();
  const { viewMode } = useViewMode();
  const [showCarousel, setShowCarousel] = useState(false);
  const { t } = useTranslation();

  // Redirect to home page when in personal mode
  useEffect(() => {
    if (viewMode === 'personal') {
      navigate('/');
      return;
    }
  }, [viewMode, navigate]);

  useEffect(() => {
    // Onboarding carousel disabled to prevent popup screens at login
    const hasSeenCarousel = localStorage.getItem('hasSeenManagerCarousel');
    if (!hasSeenCarousel) {
      localStorage.setItem('hasSeenManagerCarousel', 'true'); // Mark as seen without showing
      setShowCarousel(false);
    }
  }, []);

  const handleOnboardingComplete = () => {
    setShowCarousel(false);
    localStorage.setItem('hasSeenManagerCarousel', 'true');
  };

  const { data: profile, isError, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      try {
        console.log('Fetching profile...');
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error('Auth error:', authError);
          throw authError;
        }
        if (!user) {
          console.error('No user found');
          throw new Error("No user found");
        }

        console.log('User found:', user.id);

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Profile query error:', error);
          throw error;
        }
        
        console.log('Profile loaded:', data);
        return data;
      } catch (error: any) {
        console.error('Profile fetch failed:', error);
        toast.error(error.message || "Failed to load profile");
        navigate("/auth");
        throw error;
      }
    },
    staleTime: 300000, // Cache for 5 minutes
    gcTime: 3600000, // Keep in cache for 1 hour
  });

  const { data: restaurant } = useQuery({
    queryKey: ['restaurant', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;
      
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('manager_id', profile.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
    staleTime: 300000, // Cache for 5 minutes
    gcTime: 3600000, // Keep in cache for 1 hour
  });

  const restaurantPhoto = useMemo(() => restaurant?.photos?.[0], [restaurant?.photos]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-500">Error loading profile. Please try again later.</p>
          <button 
            onClick={() => navigate("/auth")} 
            className="text-primary hover:underline"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-safe-top">
      <ViewModeSelector />
      
      <div className="p-6 space-y-6 pb-20">
        {showCarousel && <OnboardingCarousel onComplete={handleOnboardingComplete} />}
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-primary">{t('home.welcomeToReferdBy')}</h1>
          <p className="text-lg text-muted-foreground">{t('home.tagline')}</p>
        </div>

        <RestaurantHeader 
          restaurantPhoto={restaurantPhoto} 
          restaurantName={restaurant?.name}
        />

        <RestaurantActions restaurantId={restaurant?.id} />
      </div>

      <DualRoleNavigation />
    </div>
  );
};

export default RestaurantManager;
