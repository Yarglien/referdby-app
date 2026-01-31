
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  processCustomerTokenScan, 
  processRestaurantTokenScan, 
  TokenProcessingResult 
} from "./utils/tokenProcessingUtils";
import { processActivityScan } from "./utils/activityProcessingUtils";
import { 
  isValidUuid, 
  validateAuthentication, 
  getUserRole 
} from "./utils/validationUtils";

interface ScanProcessorResult {
  success: boolean;
  role?: string;
  message?: string;
  scanType?: "activity" | "roll_token";
  tokenId?: string;
}

export const useScanProcessor = () => {
  const processScan = async (qrValue: string): Promise<ScanProcessorResult> => {
    try {
      console.log('Starting scan processing for QR value:', qrValue);
      
      // Validate user authentication
      const userId = await validateAuthentication(supabase);
      if (!userId) {
        return { success: false, message: "Authentication required" };
      }

      const loadingToast = toast.loading("Processing scan...");

      try {
        // Validate UUID format
        if (!isValidUuid(qrValue)) {
          console.error('Invalid QR format - not a UUID');
          toast.dismiss(loadingToast);
          toast.error("Invalid QR code format");
          return { success: false, message: "Invalid QR code format" };
        }
        
        // First check if this is a valid roll token
        console.log('Checking if QR is a roll token...');
        const { data: tokenCheck } = await supabase
          .from('dice_tokens')
          .select('id, token_state, restaurant_id')
          .eq('id', qrValue)
          .eq('is_active', true)
          .maybeSingle();
          
        if (tokenCheck) {
          console.log('Found roll token:', tokenCheck);
          
          // Get scanner's role for navigation
          const { data: profile } = await supabase
            .from('profiles')
            .select('role, restaurant_id')
            .eq('id', userId)
            .maybeSingle();
            
          if (!profile) {
            toast.dismiss(loadingToast);
            toast.error("Failed to verify scanner credentials");
            return { success: false, message: "Failed to verify scanner credentials" };
          }
          
          let result: TokenProcessingResult;
          
          // Process token based on user role
          if (profile.role === 'customer') {
            result = await processCustomerTokenScan(qrValue, userId);
          } else {
            // Restaurant staff role (manager, server, etc.)
            result = await processRestaurantTokenScan(qrValue, userId);
          }
          
          toast.dismiss(loadingToast);
          return {
            ...result,
            role: profile.role
          };
        }
        
        // If not a roll token, process as an activity
        console.log('Not a roll token, processing as activity...');
        const activityResult = await processActivityScan(qrValue, userId);
        
        // Get scanner's role for navigation if needed
        if (activityResult.success && !activityResult.role) {
          const userRole = await getUserRole(userId, supabase);
          activityResult.role = userRole || 'customer';
        }
        
        toast.dismiss(loadingToast);
        return activityResult;
        
      } catch (error: any) {
        console.error('Error in processing workflow:', error);
        toast.dismiss(loadingToast);
        throw error;
      }
    } catch (error: any) {
      console.error('Error processing code:', error);
      toast.error(error.message || "Failed to process scan");
      return { success: false, message: error.message || "Failed to process scan" };
    }
  };

  return { processScan };
};
