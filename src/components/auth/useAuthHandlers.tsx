import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cleanupAuthState } from "@/utils/authCleanup";

const parseErrorMessage = (error: any): string => {
  if (!error?.message) {
    return "Invalid login credentials. Please check your email and password.";
  }

  if (error.message.includes('User already registered')) {
    return "This email is already registered. Please try logging in instead or use a different email.";
  }

  if (error.message.includes('invalid_credentials')) {
    return "The email or password you entered is incorrect.";
  }
  if (error.message.includes('Email not confirmed')) {
    return "Please confirm your email address before signing in.";
  }
  if (error.message.includes('Invalid login credentials')) {
    return "The email or password you entered is incorrect.";
  }
  if (error.message.includes('session_not_found')) {
    return "Your session has expired. Please log in again.";
  }

  try {
    const errorBody = error.message.includes('{') 
      ? JSON.parse(error.message.substring(error.message.indexOf('{')))
      : null;
      
    if (errorBody?.message) {
      return errorBody.message;
    }
  } catch (e) {
    // Silent error handling
  }

  return "Invalid login credentials. Please check your email and password.";
};

export const useAuthHandlers = (inviteCode?: string | null, inviteType?: string | null) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (formData: { email: string; password: string }) => {
    try {
      if (!formData?.email || !formData?.password) {
        toast({
          title: "Validation Error",
          description: "Please enter both email and password.",
          variant: "destructive",
        });
        return false;
      }

      setIsLoading(true);

      // Clean up before any auth operation
      cleanupAuthState();

      // Check if we have invite data for signup or not for signin
      if (inviteCode && inviteType) {
        // This is a signup with invite data
        
        // Fetch invite details from database to get restaurant_id and created_by
        const { data: inviteData, error: inviteError } = await supabase
          .from('invites')
          .select('id, restaurant_id, created_by, invite_type, type')
          .eq('id', inviteCode)
          .single();

        if (inviteError) {
          throw new Error('Invalid invite code.');
        }

        // Create auth user without metadata
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          }
        });

        if (error) {
          throw error;
        }

        if (data.user && data.user.identities && data.user.identities.length === 0) {
          throw new Error('This email is already registered. Please try logging in instead or use a different email.');
        }

        // Create profile manually with invite data
        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email,
              name: data.user.email.split('@')[0], // Use email prefix as default name
              role: inviteType,
              restaurant_id: inviteData.restaurant_id,
              referer_id: inviteData.created_by
            });

          if (profileError) {
            throw new Error('Failed to create user profile.');
          }

          // Mark invite as used
          // Mark invite as used - don't block on this
          supabase
            .from('invites')
            .update({
              used_at: new Date().toISOString(),
              used_by: data.user.id,
            })
            .eq('id', inviteCode);
        }

        toast({
          title: "Registration Successful",
          description: "Your account has been created. You can now log in.",
        });
      } else {
        // Handle sign in (no invite data)
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          throw error;
        }

        if (!data.session) {
          throw new Error('No session returned after login');
        }

        // Session and user will be handled by AuthProvider
      }

      return true;
    } catch (error) {
      handleError(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = async () => {
    // AuthProvider will handle the session verification
  };

  const handleError = async (error: any) => {
    setIsLoading(false);
    
    const errorMessage = parseErrorMessage(error);

    toast({
      title: "Authentication Error",
      description: errorMessage,
      variant: "destructive",
    });
  };

  return {
    isLoading,
    handleSubmit,
    handleSuccess,
    handleError
  };
};