
import { Button } from "@/components/ui/button";
import { ArrowLeft, QrCode, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { QRImageUpload } from "@/components/scanner/QRImageUpload";
import { useProcessScan } from "@/components/scanner/ProcessScan";
import { useTranslation } from "react-i18next";

export const MyReferralsHeader = () => {
  const navigate = useNavigate();
  const [showUpload, setShowUpload] = useState(false);
  const { processScan } = useProcessScan();
  const { t } = useTranslation();

  const handleQRUpload = async (result: any) => {
    if (result && result.length > 0) {
      const success = await processScan(result[0].rawValue);
      if (success) {
        setShowUpload(false);
      }
    }
  };
  
  return (
    <div className="mb-12 space-y-8">
      <div className="p-4 flex items-center gap-4 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="text-primary hover:text-primary/80 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-bold">{t('referrals.myReferrals')}</h1>
      </div>

      <div className="space-y-4">
        <Button 
          onClick={() => navigate("/scan-customer-code")}
          className="text-lg w-full"
        >
          <QrCode className="mr-2 h-4 w-4" />
          {t('referrals.scanNewReferral')}
        </Button>

        <Button 
          onClick={() => setShowUpload(!showUpload)}
          variant="outline"
          className="text-lg w-full"
        >
          <Upload className="mr-2 h-4 w-4" />
          {t('referrals.uploadQRCode')}
        </Button>

        {showUpload && (
          <div className="bg-card p-4 rounded-lg border">
            <QRImageUpload onScan={handleQRUpload} />
          </div>
        )}
      </div>
    </div>
  );
};
