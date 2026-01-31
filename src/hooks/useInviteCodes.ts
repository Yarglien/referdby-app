
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Cache to store invite IDs globally
let inviteCodesCache: {
  userInviteId: string;
  restaurantInviteId: string;
  timestamp: number;
} | null = null;

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useInviteCodes() {
  const [userInviteCode, setUserInviteCode] = useState<string>("");
  const [restaurantInviteCode, setRestaurantInviteCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrCreateInviteIds = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Check if user is authenticated first
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.log('User not authenticated, skipping invite codes fetch');
        setIsLoading(false);
        return;
      }
      
      // Check cache first
      if (inviteCodesCache && Date.now() - inviteCodesCache.timestamp < CACHE_DURATION) {
        setUserInviteCode(inviteCodesCache.userInviteId);
        setRestaurantInviteCode(inviteCodesCache.restaurantInviteId);
        setIsLoading(false);
        return;
      }

      // Get current user
      if (!user) {
        toast.error("You must be logged in to view invite codes");
        return;
      }

      console.log('Fetching invite codes for user:', user.id);

      // Create new invite records for QR codes using the database function
      const { data: userInviteId, error: userInviteError } = await supabase
        .rpc('create_invite_for_qr', {
          p_created_by: user.id,
          p_invite_type: 'customer'
        });

      console.log('User invite response:', { userInviteId, userInviteError });

      const { data: restaurantInviteId, error: restaurantError } = await supabase
        .rpc('create_invite_for_qr', {
          p_created_by: user.id,
          p_invite_type: 'manager'
        });

      console.log('Restaurant invite response:', { restaurantInviteId, restaurantError });

      if (userInviteError || restaurantError) {
        console.error('Error creating invites:', { userInviteError, restaurantError });
        toast.error("Failed to create invite codes");
        return;
      }

      const finalUserCode = userInviteId || "";
      const finalRestaurantCode = restaurantInviteId || "";

      // Update cache
      inviteCodesCache = {
        userInviteId: finalUserCode,
        restaurantInviteId: finalRestaurantCode,
        timestamp: Date.now()
      };

      setUserInviteCode(finalUserCode);
      setRestaurantInviteCode(finalRestaurantCode);
    } catch (error) {
      console.error('Error fetching/creating invite IDs:', error);
      toast.error("Failed to load invite codes");
      // Set empty strings to prevent undefined values
      setUserInviteCode("");
      setRestaurantInviteCode("");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrCreateInviteIds();
  }, [fetchOrCreateInviteIds]);

  return {
    userInviteCode,
    restaurantInviteCode,
    isLoading
  };
}
