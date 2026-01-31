
import { useState } from "react";
import { Dice6, Info, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { RollTokenScanner } from "@/components/roll-token/RollTokenScanner";
import { ActiveTokensList } from "@/components/roll-token/ActiveTokensList";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ReferralQRDialog } from "@/components/referrals/ReferralQRDialog";
import { TokenState } from "@/utils/billing/types/billingTypes";
import { useTranslation } from 'react-i18next';

const RollToken = () => {
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [selectedTokenId, setSelectedTokenId] = useState<string>("");
  const { t } = useTranslation();

  const handlePresentToPlay = async (tokenId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error(t('rollToken.loginToPresent'));
        return;
      }

      // First check if the token is still valid
      const { data: token, error: fetchError } = await supabase
        .from('dice_tokens')
        .select('id, token_state, expires_at')
        .eq('id', tokenId)
        .eq('user_scanned_by', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (fetchError || !token) {
        console.error('Token fetch error:', fetchError);
        toast.error(t('rollToken.tokenNotFound'));
        return;
      }

      // Check if token has expired
      if (token.expires_at && new Date(token.expires_at) < new Date()) {
        toast.error(t('rollToken.tokenExpired'));
        return;
      }

      // Check if token is already processed
      if (token.token_state === TokenState.PROCESSED) {
        toast.error(t('rollToken.tokenProcessed'));
        return;
      }

      // Check if token is already presented at restaurant
      if (token.token_state === TokenState.PRESENT_AT_RESTAURANT) {
        toast.info(t('rollToken.tokenReady'));
        
        // Still show the QR dialog for convenience
        setSelectedTokenId(tokenId);
        setShowQRDialog(true);
        return;
      }

      // Present token - update state to PRESENT_AT_RESTAURANT if it's in USER_SCANNED state
      const { error: updateError } = await supabase
        .from('dice_tokens')
        .update({
          token_state: TokenState.PRESENT_AT_RESTAURANT,
          restaurant_scanned_at: new Date().toISOString()
        })
        .eq('id', tokenId)
        .eq('is_active', true)
        .eq('token_state', TokenState.USER_SCANNED);

      if (updateError) {
        console.error('Error updating token:', updateError);
        toast.error('Failed to present token');
        return;
      }

      setSelectedTokenId(tokenId);
      setShowQRDialog(true);
      toast.success(t('rollToken.tokenPresentedSuccess'));
    } catch (error: any) {
      console.error('Error presenting token:', error);
      toast.error(error.message || 'Failed to present token');
    }
  };

  const handleInfoOpen = () => setShowInfo(true);
  const handleInfoClose = (open: boolean) => setShowInfo(open);

  return (
    <div className="min-h-screen bg-background flex flex-col pt-safe-top">
      <header className="p-4 border-b flex items-center gap-4">
        <Link 
          to="/"
          className="text-primary hover:text-primary/80 transition-colors flex items-center gap-2 font-bold"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-2xl font-bold">{t('rollToken.scanRollToken')}</h1>
      </header>

      <div className="flex-1 p-4 space-y-4">
        <div className="max-w-md mx-auto">
          <RollTokenScanner />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Dice6 className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold">{t('rollToken.rollToWinTokens')}</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleInfoOpen}
            >
              <Info className="h-5 w-5 text-primary" />
            </Button>
          </div>
          
          <ActiveTokensList onPresentToken={handlePresentToPlay} />
        </div>
      </div>
      
      <Dialog open={showInfo} onOpenChange={handleInfoClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('rollToken.aboutTokens')}</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            {t('rollToken.tokenDescription')}
          </p>
        </DialogContent>
      </Dialog>
      
      <ReferralQRDialog
        isOpen={showQRDialog}
        onClose={() => setShowQRDialog(false)}
        referralCode={selectedTokenId}
        type="activity"
        title={t('rollToken.presentToRestaurant')}
        description={t('rollToken.restaurantWillScan')}
      />
      
      <BottomNav />
    </div>
  );
};

export default RollToken;
