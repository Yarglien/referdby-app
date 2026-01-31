
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { updateUserProfile } from "@/utils/profileUtils";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { RestaurantNav } from "@/components/RestaurantNav";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { useTranslation } from 'react-i18next';

const RestaurantProfile = () => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { profile, isLoading, refreshProfile } = useUser();

  // Set avatar URL from profile
  useState(() => {
    if (profile?.photo) {
      setAvatarUrl(profile.photo);
    }
  });

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user found');

        const fileExt = file.name.split('.').pop();
        const filePath = `${user.id}/profile.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('profile_photos')
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('profile_photos')
          .getPublicUrl(filePath);

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ photo: publicUrl })
          .eq('id', user.id);

        if (updateError) throw updateError;

        setAvatarUrl(publicUrl);
        await refreshProfile(); // Refresh profile data

        toast({
          title: t('common.success'),
          description: t('profile.photoUpdatedSuccess'),
        });
      } catch (error) {
        console.error('Error uploading avatar:', error);
        toast({
          title: t('common.error'),
          description: t('profile.photoUpdateFailed'),
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmit = async (values: any) => {
    const success = await updateUserProfile(values, avatarUrl, refreshProfile);
    if (success) {
      navigate('/');
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: t('common.error'),
        description: t('profile.logoutFailed'),
        variant: "destructive",
      });
    } else {
      navigate("/auth");
    }
  };

  if (isLoading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-background flex items-center justify-center">{t('common.loading')}</div>
      </ThemeProvider>
    );
  }

  if (!profile) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">{t('profile.noProfileFound')}</h2>
            <p className="text-muted-foreground mb-4">{t('profile.tryLoginAgain')}</p>
            <Button onClick={() => navigate('/auth')}>{t('profile.goToLogin')}</Button>
          </div>
        </div>
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
            onLogout={handleLogout}
          />
        </main>

        <RestaurantNav />
      </div>
    </ThemeProvider>
  );
};

export default RestaurantProfile;
