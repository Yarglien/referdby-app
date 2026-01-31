import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { currencyService } from "@/services/currencyService";
import { useTranslation } from "react-i18next";
import { Scanner } from "@yudiel/react-qr-scanner";
import { BottomNav } from "@/components/BottomNav";

const SharePoints = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [shareAmount, setShareAmount] = useState("");
  const [receiveCode, setReceiveCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('profiles')
        .select('id, current_points, home_currency, first_name, last_name')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const generateCodeMutation = useMutation({
    mutationFn: async (amount: number) => {
      if (!profile) throw new Error("Profile not loaded");
      if (amount > (profile.current_points || 0)) {
        throw new Error("Insufficient points");
      }

      const shareCode = `SHARE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

      const { data, error } = await supabase
        .from('points_sharing')
        .insert({
          sender_id: profile.id,
          points_amount: amount,
          sender_currency: profile.home_currency || 'USD',
          share_code: shareCode,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    },
    onSuccess: (data) => {
      setGeneratedCode(data.share_code);
      setShowQRDialog(true);
      setShareAmount("");
      toast.success(t('sharePoints.codeGeneratedSuccess'));
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to generate code");
    },
  });

  const claimCodeMutation = useMutation({
    mutationFn: async (code: string) => {
      if (!profile) throw new Error("Profile not loaded");

      // Get the sharing record
      const { data: sharingRecord, error: fetchError } = await supabase
        .from('points_sharing')
        .select('*')
        .eq('share_code', code.toUpperCase())
        .single();

      if (fetchError) throw new Error("Invalid or expired code");
      if (sharingRecord.is_used) throw new Error("This code has already been used");
      if (new Date(sharingRecord.expires_at) < new Date()) throw new Error("This code has expired");
      if (sharingRecord.sender_id === profile.id) throw new Error("You cannot claim your own code");

      // Convert points to receiver's currency
      const convertedPoints = await currencyService.convertCurrency(
        sharingRecord.points_amount,
        sharingRecord.sender_currency,
        profile.home_currency || 'USD'
      );

      // Update the sharing record
      const { error: updateError } = await supabase
        .from('points_sharing')
        .update({
          receiver_id: profile.id,
          is_used: true,
          used_at: new Date().toISOString(),
        })
        .eq('id', sharingRecord.id);

      if (updateError) throw updateError;

      // Update receiver's points
      const { error: receiverError } = await supabase
        .from('profiles')
        .update({
          current_points: (profile.current_points || 0) + convertedPoints.convertedAmount,
        })
        .eq('id', profile.id);

      if (receiverError) throw receiverError;

      // Get sender's current points and update
      const { data: senderProfile, error: senderFetchError } = await supabase
        .from('profiles')
        .select('current_points')
        .eq('id', sharingRecord.sender_id)
        .single();

      if (senderFetchError) throw senderFetchError;

      const { error: senderError } = await supabase
        .from('profiles')
        .update({
          current_points: (senderProfile.current_points || 0) - sharingRecord.points_amount,
        })
        .eq('id', sharingRecord.sender_id);

      if (senderError) throw senderError;

      return convertedPoints;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success(t('sharePoints.pointsReceivedSuccess', { points: Math.ceil(data.convertedAmount) }));
      setReceiveCode("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to claim code");
    },
  });

  const handleGenerateCode = () => {
    const amount = parseFloat(shareAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error(t('sharePoints.invalidAmount'));
      return;
    }
    generateCodeMutation.mutate(amount);
  };

  const handleClaimCode = () => {
    if (!receiveCode.trim()) {
      toast.error(t('sharePoints.enterCodePrompt'));
      return;
    }
    claimCodeMutation.mutate(receiveCode);
  };

  const handleScan = (result: any) => {
    if (result?.[0]?.rawValue) {
      setReceiveCode(result[0].rawValue);
      setShowScanner(false);
      claimCodeMutation.mutate(result[0].rawValue);
    }
  };

  const currentPoints = Math.ceil(profile?.current_points || 0);
  const shareAmountNum = parseFloat(shareAmount) || 0;
  const isValidAmount = shareAmountNum > 0 && shareAmountNum <= currentPoints;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6 pb-20 pt-safe-top">
      <div className="flex items-center gap-4 border-b pb-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/')}
          className="text-primary hover:text-primary/80 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-xl font-semibold">{t('sharePoints.title')}</h1>
      </div>

      <div className="bg-primary rounded-lg p-4 text-center text-white">
        <p className="text-lg">{t('sharePoints.currentBalance')}</p>
        <p className="text-4xl font-bold">{currentPoints}</p>
      </div>

      {/* Share Points Section */}
      <div className="bg-card border rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold">{t('sharePoints.shareSection')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('sharePoints.shareDescription')}
        </p>
        
        <div className="space-y-4">
          <Input
            type="number"
            placeholder={t('sharePoints.enterAmount')}
            value={shareAmount}
            onChange={(e) => setShareAmount(e.target.value)}
            min="1"
            max={currentPoints}
          />
          
          <Button
            onClick={handleGenerateCode}
            disabled={!isValidAmount || generateCodeMutation.isPending}
            className="w-full"
          >
            <Send className="mr-2 h-4 w-4" />
            {generateCodeMutation.isPending ? t('sharePoints.generating') : t('sharePoints.generateCode')}
          </Button>
        </div>
      </div>

      {/* Receive Points Section */}
      <div className="bg-card border rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold">{t('sharePoints.receiveSection')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('sharePoints.receiveDescription')}
        </p>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder={t('sharePoints.enterCode')}
              value={receiveCode}
              onChange={(e) => setReceiveCode(e.target.value.toUpperCase())}
            />
            <Button
              onClick={handleClaimCode}
              disabled={!receiveCode.trim() || claimCodeMutation.isPending}
            >
              {claimCodeMutation.isPending ? t('sharePoints.claiming') : t('sharePoints.claim')}
            </Button>
          </div>

          <Button
            onClick={() => setShowScanner(!showScanner)}
            variant="outline"
            className="w-full"
          >
            {showScanner ? t('sharePoints.hideScanner') : t('sharePoints.scanQRCode')}
          </Button>

          {showScanner && (
            <div className="border rounded-lg overflow-hidden">
              <Scanner onScan={handleScan} />
            </div>
          )}
        </div>
      </div>

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('sharePoints.codeDialogTitle')}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex justify-center">
              {generatedCode && (
                <QRCodeSVG value={generatedCode} size={200} level="H" />
              )}
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">{t('sharePoints.shareCodeLabel')}</p>
              <p className="text-lg font-mono font-bold">{generatedCode}</p>
            </div>

            <div className="text-xs text-muted-foreground text-center">
              {t('sharePoints.codeExpiry')}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default SharePoints;
