
import { useState } from "react";
import { Info, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InviteQRCode } from "./InviteQRCode";
import { InviteInfoDialog } from "./InviteInfoDialog";
import { useInviteCodes } from "@/hooks/useInviteCodes";
import { useTranslation } from 'react-i18next';

interface InviteCodesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InviteCodesDialog = ({ open, onOpenChange }: InviteCodesDialogProps) => {
  const [showInfo, setShowInfo] = useState(false);
  const { userInviteCode, restaurantInviteCode, isLoading } = useInviteCodes();
  const { t } = useTranslation();

  const handleInfoOpen = () => setShowInfo(true);
  const handleInfoClose = (open: boolean) => setShowInfo(open);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto px-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              {t('invites.yourInviteCodes')}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleInfoOpen}
                className="ml-auto"
              >
                <Info className="h-5 w-5 text-primary" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 px-2">
            {/* User Invite Section */}
            <InviteQRCode 
              inviteCode={userInviteCode} 
              type="User"
              isLoading={isLoading} 
            />

            {/* Restaurant Invite Section */}
            <InviteQRCode 
              inviteCode={restaurantInviteCode} 
              type="Restaurant"
              isLoading={isLoading} 
            />
          </div>
        </DialogContent>
      </Dialog>

      <InviteInfoDialog 
        open={showInfo} 
        onOpenChange={handleInfoClose} 
      />
    </>
  );
};
