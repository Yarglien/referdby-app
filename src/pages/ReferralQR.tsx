import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ReferralQRDialog } from "@/components/ReferralQRDialog";

const ReferralQR = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Open dialog after mount to ensure proper animation
    const t = setTimeout(() => setOpen(true), 50);
    return () => clearTimeout(t);
  }, []);

  if (!id) return null;

  return (
    <div className="min-h-screen bg-background">
      <ReferralQRDialog
        isOpen={open}
        onClose={() => navigate(-1)}
        referralCode={id}
        title="Share this Referral"
        description="Let friends scan or tap the link to claim this referral."
      />
    </div>
  );
};

export default ReferralQR;
