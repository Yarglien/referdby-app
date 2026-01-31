
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Copy } from "lucide-react";

interface QRDialogProps {
  isOpen: boolean;
  onClose: () => void;
  referralCode: string;
  type?: "invite" | "referral" | "activity" | "redeem";
  title?: string;
  description?: string;
  isPermanent?: boolean;
}

export const QRDialog = ({ 
  isOpen, 
  onClose, 
  referralCode,
  type = "referral",
  title,
  description,
  isPermanent = false
}: QRDialogProps) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  
  const getQRValue = (code: string) => {
    const baseUrl = "https://app.referdby.com";
    
    if (type === "invite") {
      return `${baseUrl}/auth?type=invite&code=${code}&view=sign_up`;
    }
    
    if (type === "referral") {
      const url = `${baseUrl}/referral-auth?referral_code=${code}`;
      console.log('Generated referral URL:', url);
      return url;
    }
    
    // For activities and other types, create a URL that shows a message for regular scanners
    // but the ReferdBy app can extract the code from the URL
    if (type === "activity" || type === "redeem") {
      return `${baseUrl}/scan?code=${code}&type=${type}&msg=Please use ReferdBy app to scan this code`;
    }
    
    return code;
  };

  const getTitle = () => {
    if (title) return title;
    
    switch (type) {
      case "invite":
        return isPermanent ? "ReferdBy Permanent Invite Code" : "ReferdBy Invite QR Code";
      case "referral":
        return "Share this Referral";
      case "activity":
        return "Present Referral to Restaurant";
      case "redeem":
        return "Points Redemption Code";
      default:
        return "QR Code";
    }
  };

  const getDescription = () => {
    if (description) return description;
    
    switch (type) {
      case "invite":
        return isPermanent 
          ? "Share this code with anyone to join ReferdBy" 
          : "Scan this code to join ReferdBy";
      case "referral":
        return "";
      case "activity":
        return "Present this code to the restaurant";
      case "redeem":
        return "Present this code to redeem your points";
      default:
        return "Scan this QR code";
    }
  };

  const getScanInstructions = () => {
    if (type === "invite") {
      return "SCAN THIS CODE WITH YOUR PHONE";
    }
    if (type === "referral") {
      return "SCAN THIS CODE WITH THE REFERDBY APP BY SELECTING MY REFERRALS AND SCAN NEW REFERRAL";
    }
    return "SCAN THIS CODE WITH THE REFERDBY APP";
  };

  const getShareableUrl = () => {
    return getQRValue(referralCode);
  };

  const getShareText = () => {
    switch (type) {
      case "invite":
        return "Join ReferdBy and start earning rewards! Use this invitation link:";
      case "referral":
        return "I found this awesome restaurant on ReferdBy! Click the link to claim this referral and earn points when you visit:";
      case "activity":
        return "Present this code at the restaurant:";
      case "redeem":
        return "Use this code to redeem points:";
      default:
        return "Check this out on ReferdBy:";
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getShareableUrl());
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };


  useEffect(() => {
    if (!isOpen || !referralCode) return;

    console.log('QRDialog opened with code:', referralCode, 'type:', type);

    // Handle multiple referral codes (comma-separated)
    const referralCodes = referralCode.split(',');
    
    // Don't set up subscription for permanent codes or multiple codes
    if (isPermanent || referralCodes.length > 1) return;

    let table = '';
    switch (type) {
      case 'invite':
        table = 'invites';
        break;
      case 'referral':
        table = 'referrals';
        break;
      case 'activity':
        table = 'activities';
        break;
      default:
        return;
    }

    console.log('Setting up subscription for:', { table, referralCode });

    const subscription = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: table,
          filter: `id=eq.${referralCode}`,
        },
        async (payload) => {
          console.log('Received update:', payload);
          const newStatus = payload.new.status;
          const isProcessed = ['used', 'processed', 'completed', 'presented'].includes(newStatus);
          
          if (isProcessed) {
            console.log(`${table} status changed to ${newStatus}, closing dialog and navigating`);
            onClose();
            toast.success('QR code successfully scanned by restaurant');
            
            // Get user role to determine correct home route
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

              if (profile?.role === 'manager') {
                navigate('/restaurant-manager');
              } else if (profile?.role === 'server') {
                navigate('/server-home');
              } else {
                navigate('/');
              }
            } else {
              navigate('/');
            }
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up subscription');
      subscription.unsubscribe();
    };
  }, [isOpen, referralCode, type, navigate, onClose, isPermanent]);

  if (!isOpen || !referralCode) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-6 gap-4">
          <QRCodeSVG
            value={getQRValue(referralCode)}
            size={256}
            level="H"
            includeMargin={true}
          />
          <p className="text-lg font-semibold text-foreground uppercase text-center">
            {getScanInstructions()}
          </p>

          {/* Share options for referrals */}
          {type === "referral" && (
            <>
              <Separator className="w-full" />
              <div className="w-full space-y-3">
                <p className="text-sm font-medium text-center text-muted-foreground">
                  Or share this referral link:
                </p>
                
                {/* Copy Link Button */}
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  className="w-full"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  {copied ? "Link Copied!" : "Copy Link"}
                </Button>

              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
