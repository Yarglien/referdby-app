
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";

interface RedeemQRDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activityId: string | null;
}

export const RedeemQRDialog = ({ open, onOpenChange, activityId }: RedeemQRDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Redemption QR Code</DialogTitle>
          <DialogDescription>
            Present this QR code to the restaurant staff to redeem your points
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          {activityId && (
            <QRCodeSVG
              value={activityId}
              size={200}
              level="H"
              includeMargin
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
