
import { QRDialog } from "@/components/shared/QRDialog";

interface ReferralQRDialogProps {
  isOpen: boolean;
  onClose: () => void;
  referralCode: string;
  type?: "invite" | "referral" | "activity";
  title?: string;
  description?: string;
}

export const ReferralQRDialog = ({ 
  isOpen, 
  onClose, 
  referralCode, 
  type = "referral",
  title,
  description 
}: ReferralQRDialogProps) => {
  return (
    <QRDialog
      isOpen={isOpen}
      onClose={onClose}
      referralCode={referralCode}
      type={type}
      title={title}
      description={description}
    />
  );
};
