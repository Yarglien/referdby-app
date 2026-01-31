
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const generateRollToken = async (restaurantId?: string, userId?: string) => {
  try {
    console.log('=== DEBUG: Starting generateRollToken ===');
    console.log('Input params:', { restaurantId, userId });
    
    // First check if user is authenticated with proper session handling
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    console.log('Session check result:', { session: !!session, error: sessionError });
    
    if (sessionError || !session) {
      console.error('Authentication error:', sessionError);
      toast.error('Please login to generate tokens');
      return null;
    }

    if (!userId || !restaurantId) {
      console.error('Missing required parameters:', { userId, restaurantId });
      toast.error('Missing required parameters');
      return null;
    }

    // Check user profile and permissions
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        id, 
        role, 
        restaurant_id,
        restaurants(has_roll_meal_offer)
      `)
      .eq('id', userId)
      .single();

    console.log('Profile check result:', { profile, profileError });

    if (profileError || !profile) {
      console.error('Profile error:', profileError);
      toast.error('User profile not found');
      return null;
    }

    if (!profile.restaurant_id || profile.restaurant_id !== restaurantId) {
      console.error('Restaurant mismatch:', { userRestaurant: profile.restaurant_id, requestedRestaurant: restaurantId });
      toast.error('User not associated with this restaurant');
      return null;
    }

    if (!profile.role || !['manager', 'server'].includes(profile.role)) {
      console.error('Invalid role:', profile.role);
      toast.error('Only managers and servers can generate tokens');
      return null;
    }

    if (!profile.restaurants?.has_roll_meal_offer) {
      console.error('Roll meal offer not enabled for restaurant');
      toast.error('Roll for meal feature is not enabled for this restaurant');
      return null;
    }

    // Create expiry date 4 days from now
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 4);
    expiryDate.setHours(23, 59, 59, 999);

    console.log('Creating token with:', {
      restaurantId,
      userId,
      expiryDate: expiryDate.toISOString()
    });

    const { data: token, error } = await supabase
      .from('dice_tokens')
      .insert({
        restaurant_id: restaurantId,
        created_by: userId,
        created_at: new Date().toISOString(),
        expires_at: expiryDate.toISOString(),
        is_active: true,
        token_state: 'created'
      })
      .select()
      .single();

    console.log('Insert result:', { token, error });

    if (error) {
      console.error('Token creation error:', error);
      toast.error(`Failed to generate token: ${error.message}`);
      return null;
    }

    console.log('Token generated successfully:', token);
    toast.success('Roll token generated successfully');
    return token;
  } catch (error: any) {
    console.error('Error generating token:', error);
    toast.error(error.message || 'Failed to generate token');
    return null;
  }
};
