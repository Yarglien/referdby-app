
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "./ProfileProvider";
import { useNavigate } from "react-router-dom";
import { currencyService } from "@/services/currencyService";
import { cleanupAuthState } from "@/utils/authCleanup";
import { useUser } from "@/contexts/UserContext";
import { useTranslation } from "react-i18next";
import { useState } from "react";

export const useProfileActions = () => {
  const { toast } = useToast();
  const { setAvatarUrl, refreshProfile } = useProfile();
  const { clearCache } = useUser();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

        // Update the profile with the new photo URL
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ photo: publicUrl })
          .eq('id', user.id);

        if (updateError) throw updateError;

        setAvatarUrl(publicUrl);
        await refreshProfile(); // Refresh profile data

        toast({
          title: "Success",
          description: "Profile photo updated successfully",
        });

        // Log the update for debugging
        console.log('Profile photo updated:', publicUrl);
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
    if (isSubmitting) {
      console.log('=== SUBMISSION ALREADY IN PROGRESS ===');
      return;
    }
    
    setIsSubmitting(true);
    try {
      console.log('=== GETTING USER ===');
      const { data: { user } } = await supabase.auth.getUser();
      console.log('User fetched:', user?.id);
      if (!user) {
        console.log('No user found, showing error toast');
        toast({
          title: "Error",
          description: "You must be logged in to update your profile",
          variant: "destructive",
        });
        return;
      }

      console.log('Updating profile with values:', values);

      // Get current profile to check for currency changes
      const { data: currentProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('home_currency, current_points')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;

      let updatedPoints = currentProfile.current_points;

      // Check if home currency has changed and convert points accordingly
      if (currentProfile.home_currency !== values.homeCurrency && currentProfile.current_points) {
        console.log('Currency changed from', currentProfile.home_currency, 'to', values.homeCurrency);
        console.log('Converting points from', currentProfile.current_points);
        
        try {
          const conversionResult = await currencyService.convertCurrency(
            Number(currentProfile.current_points),
            currentProfile.home_currency || 'USD',
            values.homeCurrency
          );
          
          updatedPoints = conversionResult.convertedAmount;
          console.log('Points converted to:', updatedPoints);
          
          toast({
            title: "Currency Updated",
            description: `Your points have been converted from ${currentProfile.home_currency || 'USD'} to ${values.homeCurrency}`,
          });
        } catch (conversionError) {
          console.error('Currency conversion failed:', conversionError);
          toast({
            title: "Warning",
            description: "Currency updated but points conversion failed. Please contact support.",
            variant: "destructive",
          });
        }
      }

      // Prepare update data (DON'T include last_used as it's handled by auth hooks)
      const updateData = {
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
        current_points: updatedPoints,
        theme: values.theme,
        email_notifications: values.emailNotifications,
        push_notifications: values.pushNotifications,
      };

      console.log('=== PROFILE UPDATE DATA ===');
      console.log('Update data being sent:', updateData);
      console.log('Language preference value:', values.languagePreference);
      console.log('Raw updateData object:', JSON.stringify(updateData, null, 2));

      // Update the profile with all the form values including converted points
      console.log('=== EXECUTING SUPABASE UPDATE ===');
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      console.log('Update result - error:', error);
      if (error) throw error;

      // If language preference changed, update i18n immediately
      if (values.languagePreference && values.languagePreference !== i18n.language) {
        i18n.changeLanguage(values.languagePreference);
      }

      // Log the update for debugging
      console.log('Profile updated with home currency:', values.homeCurrency);
      console.log('Points updated to:', updatedPoints);

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      
      // Refresh the profile data
      await refreshProfile();
    } catch (error) {
      console.error('=== ERROR IN HANDLE SUBMIT ===');
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      cleanupAuthState();
      clearCache(); // Clear user context cache
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error during logout:', error);
      toast({
        title: "Error",
        description: "Failed to log out completely. Please close your browser.",
        variant: "destructive",
      });
    }
  };

  return {
    handleAvatarChange,
    handleSubmit,
    handleLogout
  };
};
