
import { BottomNav } from "@/components/BottomNav";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { useProfile } from "./ProfileProvider";
import { useProfileActions } from "./ProfileActions";
import { useAuth } from "../providers/AuthProvider";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useTranslation } from "react-i18next";

export const ProfileLayout = () => {
  const navigate = useNavigate();
  const { profile, isLoading, avatarUrl } = useProfile();
  const { handleAvatarChange, handleSubmit } = useProfileActions();
  const { handleSignOut } = useAuthSession();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-background flex items-center justify-center">{t('common.loading')}</div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen pb-20 bg-background pt-safe-top">
        <header className="p-4 border-b flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">{t('profile.myProfile')}</h1>
          <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
            <Settings className="h-5 w-5" />
          </Button>
        </header>

        <main className="p-4 space-y-6">
          <ProfileHeader 
            profile={profile}
            avatarUrl={avatarUrl}
            onAvatarChange={handleAvatarChange}
          />
          <ProfileForm 
            profile={profile}
            onSubmit={handleSubmit}
            onLogout={handleSignOut}
          />
        </main>

        <BottomNav />
      </div>
    </ThemeProvider>
  );
};
