
import { Copy, Share2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTranslation } from 'react-i18next';

interface InviteQRCodeProps {
  inviteCode: string;
  type: 'User' | 'Restaurant';
  isLoading: boolean;
}

export const InviteQRCode = ({ inviteCode, type, isLoading }: InviteQRCodeProps) => {
  const { t } = useTranslation();
  const getInviteUrl = (inviteId: string) => {
    // Use production domain for QR codes - point directly to auth with signup view
    const baseUrl = "https://app.referdby.com";
    // Point directly to auth page with invite parameter and sign up view
    return `${baseUrl}/auth?invite=${inviteId}&view=sign_up`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success(`${type} invite link copied to clipboard!`))
      .catch(() => toast.error("Failed to copy link"));
  };

  const shareInvite = async () => {
    const url = getInviteUrl(inviteCode);
    const title = `Join ReferdBy as a ${type === 'User' ? 'User' : 'Restaurant'}`;
    const text = `I'm inviting you to join ReferdBy, your trusted referral network!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url
        });
        toast.success("Invite shared successfully!");
      } catch (error) {
        console.error("Error sharing:", error);
        if ((error as Error).name !== 'AbortError') {
          // Fall back to copying to clipboard when share fails
          copyToClipboard(url);
          toast.info("Permission denied for sharing. Invite link copied to clipboard - ready to paste into social media or messaging apps!");
        }
      }
    } else {
      copyToClipboard(url);
    }
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-medium mb-4">{t(`invites.${type.toLowerCase()}Invite`)} Invite</h3>
      {isLoading || !inviteCode ? (
        <div className="flex justify-center p-4">
          <div className="animate-pulse bg-gray-300 h-48 w-48 rounded-lg"></div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <QRCodeSVG
            value={getInviteUrl(inviteCode)}
            size={200}
            level="H"
            includeMargin={true}
          />
          <div className="flex justify-between mt-4 w-full max-w-[200px]">
            <Button 
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(getInviteUrl(inviteCode))}
              className="flex items-center gap-1"
              disabled={!inviteCode}
            >
              <Copy className="h-4 w-4" />
              Copy
            </Button>
            <Button 
              size="sm"
              onClick={shareInvite}
              className="flex items-center gap-1"
              disabled={!inviteCode}
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
