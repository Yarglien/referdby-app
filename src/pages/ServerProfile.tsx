
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { ServerNav } from "@/components/ServerNav";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const ServerProfile = () => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      // First, get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      console.log('Current user ID:', user.id);

      // Then fetch the profile data
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }
      
      console.log('Profile data fetched:', profile);
      
      if (profile?.photo) {
        setAvatarUrl(profile.photo);
      }
      
      return profile;
    }
  });

  // Redirect customers to the correct profile page
  if (profile && profile.role === 'customer') {
    navigate('/profile', { replace: true });
    return null;
  }

  // Only allow servers and managers
  if (profile && profile.role !== 'server' && profile.role !== 'manager') {
    navigate('/', { replace: true });
    return null;
  }

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
        await refetch();

        toast({
          title: "Success",
          description: "Profile photo updated successfully",
        });
      } catch (error) {
        console.error('Error uploading avatar:', error);
        toast({
          title: "Error",
          description: "Failed to update profile photo",
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to update your profile",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: values.firstName,
          last_name: values.lastName,
          email: values.email,
          country_code: values.countryCode,
          mobile_number: values.phoneNumber,
          home_address_line1: values.address,
          home_address_line2: values.address2,
          home_address_line3: values.address3,
          home_currency: values.homeCurrency,
          language_preference: values.languagePreference,
          theme: values.theme,
          email_notifications: values.emailNotifications,
          push_notifications: values.pushNotifications,
          photo: avatarUrl
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      
      await refetch();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    } else {
      navigate("/auth");
    }
  };

  if (isLoading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen pb-20 bg-background pt-safe-top">
        <header className="p-4 border-b flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
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

        <ServerNav />
      </div>
    </ThemeProvider>
  );
};

export default ServerProfile;
