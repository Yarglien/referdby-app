import { UserOnboardingCarousel } from "@/components/user/onboarding/UserOnboardingCarousel";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { WelcomeHeader } from "@/components/home/WelcomeHeader";
import { ProfilePoints } from "@/components/home/ProfilePoints";
import { MenuGrid } from "@/components/home/MenuGrid";
import { DualRoleNavigation } from "@/components/DualRoleNavigation";
import { PartialProfile } from "@/types/profile.types";


const UserHome = () => {
  const navigate = useNavigate();
  const [showCarousel, setShowCarousel] = useState(false);

  const { data: profile, isError } = useQuery<PartialProfile | null>({
    queryKey: ['profile'],
    queryFn: async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error('Auth error:', authError);
          throw new Error("Authentication error. Please login again.");
        }
        
        if (!user) {
          console.log('No user found');
          throw new Error("No user found. Please login again.");
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('id, role, first_name, current_points, photo, home_currency')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Profile fetch error:', error);
          throw error;
        }

        return data;
      } catch (error: any) {
        console.error('Profile fetch failed:', error);
        toast.error(error.message || "Failed to load profile");
        navigate("/auth");
        throw error;
      }
    },
    retry: false,
    staleTime: 300000, // Cache for 5 minutes
    gcTime: 3600000 // Keep in garbage collection for 1 hour
  });

  useEffect(() => {
    if (profile && profile.role !== 'customer') {
      navigate('/');
    }
  }, [profile, navigate]);

  const handleOnboardingComplete = () => {
    setShowCarousel(false);
  };

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
    <div className="min-h-screen bg-background px-6 space-y-6 pb-20 pt-safe-top">
      {showCarousel && <UserOnboardingCarousel onComplete={handleOnboardingComplete} />}
      
      <WelcomeHeader profile={profile} />
      <ProfilePoints profile={profile} />
      <MenuGrid profile={profile} />
      <DualRoleNavigation />
    </div>
  );
};

export default UserHome;
