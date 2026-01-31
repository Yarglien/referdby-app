import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Users, Database } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      return data;
    },
  });

  const syncUserProfiles = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('sync-user-profile');
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "User profiles have been synchronized",
      });
      
      // Reload the page to reflect changes
      window.location.reload();
    } catch (error) {
      console.error('Error syncing profiles:', error);
      toast({
        title: "Error",
        description: "Failed to sync user profiles",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Redirect if not authenticated or not an admin
    if (!profile && profile !== undefined) {
      navigate('/auth');
    } else if (profile?.role !== 'admin') {
      navigate('/');
    }
  }, [profile, navigate]);

  // If profile is still loading, show loading state
  if (profile === undefined) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // If no profile or not an admin, the useEffect will handle redirection
  if (!profile || profile.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-6 pt-safe-top">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-primary flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Admin Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">System administration and maintenance</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-card rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">User Management</h2>
            </div>
            <p className="text-muted-foreground">
              Synchronize user profiles and manage user data across the system.
            </p>
            <Button 
              onClick={syncUserProfiles}
              className="w-full"
            >
              Sync User Profiles
            </Button>
          </div>

          <div className="bg-card rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Database className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">Database Management</h2>
            </div>
            <p className="text-muted-foreground">
              Monitor and maintain database operations and data integrity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;