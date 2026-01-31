
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface DeleteAccountOptions {
  userRole: string | null;
  userId: string;
}

export const useAccountDeletion = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const deleteAccount = async ({ userRole, userId }: DeleteAccountOptions) => {
    try {
      if (userRole === 'manager') {
        // For managers, delete their restaurant and all associated data
        const { data: restaurant, error: restaurantError } = await supabase
          .from('restaurants')
          .select('id')
          .eq('manager_id', userId)
          .single();
          
        if (restaurant) {
          const { error: deleteRestaurantError } = await supabase
            .from('restaurants')
            .delete()
            .eq('id', restaurant.id);
            
          if (deleteRestaurantError) throw deleteRestaurantError;
        }
        
        // Delete manager profile completely
        const { error: profileError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userId);
          
        if (profileError) throw profileError;
      } else {
        // For regular users, anonymize data instead of deleting
        const anonymizedData = {
          first_name: null,
          last_name: null,
          name: 'Deleted User',
          email: null,
          mobile_number: null,
          photo: null,
          home_address_line1: null,
          home_address_line2: null,
          home_address_line3: null,
          home_country: null,
          country_code: null,
          updated_at: new Date().toISOString()
        };
        
        const { error: anonymizeError } = await supabase
          .from('profiles')
          .update(anonymizedData)
          .eq('id', userId);
          
        if (anonymizeError) throw anonymizeError;
      }
      
      // Sign out from Supabase auth
      await supabase.auth.signOut();
      
      // Show success message
      const successMessage = userRole === 'manager' 
        ? "Your account and restaurant have been deleted. We're sorry to see you go!"
        : "Your data has been anonymized. We're sorry to see you go!";
      
      toast({
        title: "Success",
        description: successMessage,
      });
      
      // Redirect to auth page
      navigate('/auth');
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting account:', error);
      
      // Show error message
      toast({
        title: "Error",
        description: "Failed to delete your account. Please try again later.",
        variant: "destructive",
      });
      
      return { 
        success: false, 
        error 
      };
    }
  };
  
  return { deleteAccount };
};
