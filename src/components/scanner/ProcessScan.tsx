
import { useNavigate } from "react-router-dom";
import { useScanProcessor } from "./ScanProcessor";
import { toast } from "sonner";

export const useProcessScan = () => {
  const navigate = useNavigate();
  const { processScan } = useScanProcessor();

  const handleScan = async (qrValue: string) => {
    try {
      // Clean the QR value if it has a prefix
      const cleanQrValue = qrValue.startsWith('roll-token:') 
        ? qrValue.replace('roll-token:', '') 
        : qrValue;
      
      const result = await processScan(cleanQrValue);
      
      if (!result.success) {
        return false;
      }

      // Force a short delay to ensure the database updates propagate
      await new Promise(resolve => setTimeout(resolve, 500));

      // Handle navigation based on scan type and role
      if (result.scanType === "roll_token") {
        navigate("/active-rollers", { 
          replace: true,
          state: { 
            recentlyScanned: result.tokenId
          }
        });
      } else {
        // Regular activity scan navigation
        if (result.role === 'manager') {
          navigate("/restaurant-manager", { replace: true });
        } else if (result.role === 'server') {
          navigate("/server-home", { replace: true });
        } else {
          navigate("/my-referrals", { replace: true });
        }
      }

      return result;
    } catch (error) {
      toast.error("Failed to process scan. Please try again.");
      return false;
    }
  };

  return { processScan: handleScan };
};
