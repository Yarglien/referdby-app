import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { currencyService } from "@/services/currency/currencyService";
import i18n from "@/i18n";

interface ProfileUpdateValues {
  firstName: string;
  lastName: string;
  email: string;
  countryCode?: string;
  phoneNumber?: string;
  address?: string;
  address2?: string;
  address3?: string;
  homeCurrency: string;
  languagePreference: string;
  theme?: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
}

export const updateUserProfile = async (
  values: ProfileUpdateValues, 
  avatarUrl?: string | null,
  refreshProfile?: () => Promise<void>
) => {
  try {
    console.log('=== SHARED PROFILE UPDATE ===');
    console.log('Form values received:', values);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Auth error:', authError);
      toast.error(`Failed to verify user: ${authError.message}`);
      return false;
    }

    if (!user) {
      console.log('No user found, aborting submission');
      toast.error("You must be logged in to update your profile");
      return false;
    }
    
    console.log('User found:', user.id);

    // Get current profile to check for currency changes
    console.log('Fetching current profile for user:', user.id);
    const { data: currentProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('home_currency, current_points')
      .eq('id', user.id)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching current profile:', fetchError);
      throw fetchError;
    }
    
    console.log('Current profile data:', currentProfile);

    let updatedPoints = currentProfile?.current_points;

    // Check if home currency has changed and convert points accordingly
    if (currentProfile?.home_currency !== values.homeCurrency && currentProfile?.current_points) {
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
        
        toast.success(`Your points have been converted from ${currentProfile.home_currency || 'USD'} to ${values.homeCurrency}`);
      } catch (conversionError) {
        console.error('Currency conversion failed:', conversionError);
        toast.error("Currency updated but points conversion failed. Please contact support.");
      }
    }

    const updateData: any = {
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
    };

    // Include points if they changed
    if (updatedPoints !== undefined) {
      updateData.current_points = updatedPoints;
    }

    // Include avatar if provided
    if (avatarUrl !== undefined) {
      updateData.photo = avatarUrl;
    }

    console.log('=== UPDATE DATA ===', updateData);
    console.log('Updating profile for user:', user.id);

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id);

    console.log('Update response - data:', data);
    console.log('Update response - error:', error);

    if (error) {
      console.error('Supabase update error:', error);
      throw error;
    }

    // If language preference changed, update i18n immediately
    if (values.languagePreference && values.languagePreference !== i18n.language) {
      i18n.changeLanguage(values.languagePreference);
    }

    console.log('Profile update successful');
    
    // Refresh profile data if function provided
    if (refreshProfile) {
      await refreshProfile();
    }

    toast.success("Profile updated successfully");

    return true;
  } catch (error) {
    console.error('Error updating profile:', error);
    toast.error(`Failed to update profile: ${error.message || 'Unknown error'}`);
    return false;
  }
};