
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScannerHeader } from "@/components/scanner/ScannerHeader";
import { ScannerComponent } from "@/components/scanner/ScannerComponent";
import { useProcessScan } from "@/components/scanner/ProcessScan";
import { RestaurantNav } from "@/components/RestaurantNav";
import { BottomNav } from "@/components/BottomNav";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from 'react-i18next';
import { useUser } from "@/contexts/UserContext";

const ScanCustomerCode = () => {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(true);
  const { processScan } = useProcessScan();
  const isMobile = useIsMobile();
  const { t } = useTranslation();
  const { profile } = useUser();
  const isCustomer = profile?.role === 'customer';

  const handleScan = async (result: any) => {
    if (!result || result.length === 0) return;
    
    try {
      setScanning(false);
      const qrValue = result[0].rawValue;
      console.log('Raw QR code value:', qrValue);

      // Check if it starts with roll-token: prefix
      const processValue = qrValue.startsWith('roll-token:') 
        ? qrValue.replace('roll-token:', '') 
        : qrValue;
      
      console.log('Processing value:', processValue);
      toast.loading(t('restaurant.processingScan'), { id: "scanning-toast" });
      
      const processResult = await processScan(processValue);
      
      toast.dismiss("scanning-toast");
      
      if (!processResult) {
        console.log('Scan processing failed, re-enabling scanner');
        // Toast error is already shown in the processScan function
        setTimeout(() => setScanning(true), 1500); // Add a small delay before re-enabling scanner
      }
      // Navigation is handled in useProcessScan
    } catch (error) {
      console.error('Scan error:', error);
      toast.dismiss("scanning-toast");
      toast.error(t('restaurant.scanProcessingFailed'));
      setTimeout(() => setScanning(true), 1500); // Add a small delay before re-enabling scanner
    }
  };

  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };

  return (
    <div className="min-h-screen bg-background pb-16 pt-safe-top">
      <ScannerHeader 
        title={isCustomer ? "Scan Referral" : "QR Scanner"} 
        showBackButton={true} 
        onBack={handleBack} 
      />
      
      <div className={`p-4 ${!isMobile ? "max-w-4xl mx-auto" : ""}`}>
        <div className={`${!isMobile ? "shadow-lg rounded-lg overflow-hidden bg-card p-6" : ""}`}>
          <div className="mb-4 p-4 bg-card border rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Scan a referral QR code</h2>
            <p className="text-sm text-muted-foreground">
              Scan a friend's referral QR code to add it to your My Referrals.
            </p>
          </div>
          
          <ScannerComponent 
            onScan={handleScan}
            scanning={scanning}
          />
          
          <p className={`mt-4 text-sm text-center text-muted-foreground ${!isMobile ? "max-w-md mx-auto" : ""}`}>
            Position the QR code in the center of the camera view
          </p>
        </div>
      </div>

      {isCustomer ? <BottomNav /> : <RestaurantNav />}
    </div>
  );
};

export default ScanCustomerCode;
