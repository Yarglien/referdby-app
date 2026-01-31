
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/ThemeProvider";
import { BottomNav } from "@/components/BottomNav";
import { ServerNav } from "@/components/ServerNav";
import { RestaurantNav } from "@/components/RestaurantNav";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { SettingsForm, SettingsFormValues } from "@/components/settings/SettingsForm";

const SettingsPage = () => {
  const [userRole, setUserRole] = useState<string | null>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile-settings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }
      
      setUserRole(profile.role);
      
      const initialValues: SettingsFormValues = {
        theme: (profile.theme as "light" | "dark" | "system") || "system",
        emailNotifications: profile.email_notifications === true,
        pushNotifications: profile.push_notifications === true,
        distanceUnit: (profile.distance_unit as "miles" | "km") || "miles",
      };
      
      return { profile, initialValues };
    }
  });

  const getNavigationComponent = () => {
    if (userRole === 'restaurant_manager') {
      return <RestaurantNav />;
    } else if (userRole === 'server') {
      return <ServerNav />;
    }
    return <BottomNav />;
  };

  if (isLoading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen pb-20 bg-background pt-safe-top">
        <SettingsHeader />

        <main className="p-4 md:p-6 space-y-8 animate-fade-in">
          <SettingsForm 
            initialValues={profile?.initialValues} 
            userRole={userRole} 
          />
        </main>

        {getNavigationComponent()}
      </div>
    </ThemeProvider>
  );
};

export default SettingsPage;
