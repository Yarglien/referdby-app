
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ScannerComponent } from "@/components/scanner/ScannerComponent";
import { TokenState } from "@/utils/billing/types/billingTypes";
import { useTranslation } from "react-i18next";

export const RollTokenScanner = () => {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(true);
  const [processing, setProcessing] = useState(false);
  const { t } = useTranslation();

  const handleScan = async (result: any) => {
    if (!result || result.length === 0) return;
    if (processing) return; // Prevent multiple scans while processing
    
    try {
      setScanning(false);
      setProcessing(true);
      
      const qrValue = result[0].rawValue;
      let tokenId = qrValue;
      
      // Check if it has a prefix and remove it
      if (qrValue.startsWith('roll-token:')) {
        tokenId = qrValue.replace('roll-token:', '');
      }
      
      console.log('Processing token:', tokenId);
      toast.loading("Processing scan...", { id: "scanning-token" });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.dismiss("scanning-token");
        toast.error('Please login to scan tokens');
        navigate('/auth');
        return;
      }

      // Check if token exists and is valid
      const { data: token, error: fetchError } = await supabase
        .from('dice_tokens')
        .select('*')
        .eq('id', tokenId)
        .eq('is_active', true)
        .single();

      if (fetchError || !token) {
        console.error('Token fetch error:', fetchError);
        toast.dismiss("scanning-token");
        toast.error('Invalid or expired token');
        setScanning(true);
        setProcessing(false);
        return;
      }

      // Check if token is already scanned
      if (token.token_state !== TokenState.CREATED) {
        toast.dismiss("scanning-token");
        toast.error('This token has already been scanned');
        setScanning(true);
        setProcessing(false);
        return;
      }

      // Update the token
      const { error: updateError } = await supabase
        .from('dice_tokens')
        .update({
          user_scanned_by: user.id,
          user_scanned_at: new Date().toISOString(),
          token_state: TokenState.USER_SCANNED
        })
        .eq('id', tokenId)
        .eq('is_active', true);

      toast.dismiss("scanning-token");
      
      if (updateError) {
        console.error('Error scanning token:', updateError);
        toast.error('Failed to process token');
        setScanning(true);
        setProcessing(false);
        return;
      }

      toast.success("Roll token scanned successfully! Come back within 4 days to try your luck!");
      
      // Delay before refreshing to allow user to see the success message
      setTimeout(() => {
        setProcessing(false);
        // Force refresh by invalidating the query cache
        navigate("/roll-token", { replace: true });
      }, 1500);
      
    } catch (error: any) {
      console.error('Error processing scan:', error);
      toast.dismiss("scanning-token");
      toast.error(error.message || 'Failed to process scan');
      setScanning(true);
      setProcessing(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <p className="text-muted-foreground text-sm text-center px-4">
        {t('rollToken.scanInstructions')}
      </p>
      {processing ? (
        <div className="h-[300px] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">{t('rollToken.processingToken')}</p>
          </div>
        </div>
      ) : (
        <ScannerComponent onScan={handleScan} scanning={scanning} />
      )}
    </div>
  );
};
