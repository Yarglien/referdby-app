
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DualRoleNavigation } from "@/components/DualRoleNavigation";
import { ViewModeSelector } from "@/components/ViewModeSelector";
import { useUser } from "@/contexts/UserContext";
import { useViewMode } from "@/contexts/ViewModeContext";
import { WelcomeHeader } from '@/components/home/WelcomeHeader';
import { ProfilePoints } from '@/components/home/ProfilePoints';
import { MenuGrid } from '@/components/home/MenuGrid';
import { PartialProfile } from '@/types/profile.types';
import { useTranslation } from 'react-i18next';

const Index = () => {
  const navigate = useNavigate();
  const { profile, isLoading } = useUser();
  const { viewMode } = useViewMode();
  const { t } = useTranslation();

  useEffect(() => {
    // Only route when we have profile data and are not loading
    if (!isLoading && profile) {
      console.log('Index page routing check:', { role: profile.role, userId: profile.id, viewMode });
      
      // Only redirect managers/servers, don't interfere with customers
      if (profile.role === 'manager' && viewMode === 'restaurant') {
        console.log('Redirecting manager to restaurant-manager');
        window.scrollTo(0, 0);
        navigate('/restaurant-manager');
      } else if (profile.role === 'server' && viewMode === 'restaurant') {
        console.log('Redirecting server to server-home');
        window.scrollTo(0, 0);
        navigate('/server-home');
      } else {
        console.log('Staying on customer home page, role:', profile.role, 'viewMode:', viewMode);
      }
    }
  }, [profile, isLoading, navigate, viewMode]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-2 text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Only render if user is a customer or in personal view mode
  if (profile && profile.role !== 'customer' && profile.role !== undefined && viewMode === 'restaurant') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <ViewModeSelector />
      
      <main className="p-4 space-y-4 pb-20">
        <WelcomeHeader profile={profile} />
        <ProfilePoints profile={profile} />
        
        <p className="text-foreground">
          {t('home.greeting', { name: profile?.first_name })}
        </p>

        <MenuGrid profile={profile} />
      </main>

      <DualRoleNavigation />
    </div>
  );
};

export default Index;
