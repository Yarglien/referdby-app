import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Download, Smartphone } from "lucide-react";

const ScanMessage = () => {
  const [searchParams] = useSearchParams();
  const message = searchParams.get('msg') || 'Please use ReferdBy app to scan this code';
  const type = searchParams.get('type') || 'referral';
  const code = searchParams.get('code');

  const getTypeDisplay = () => {
    switch (type) {
      case 'referral':
        return 'Referral Code';
      case 'activity':
        return 'Activity Code';
      case 'redeem':
        return 'Redemption Code';
      default:
        return 'Code';
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <AlertCircle className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-xl">ReferdBy {getTypeDisplay()}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">{message}</p>
          
          {code && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Code:</p>
              <p className="font-mono text-sm break-all">{code}</p>
            </div>
          )}
          
          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-primary" />
              <p className="text-sm text-left">Download the ReferdBy app to scan this code</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Download className="h-5 w-5 text-primary" />
              <p className="text-sm text-left">Available for iOS and Android devices</p>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              If you have the ReferdBy app installed, please use the in-app scanner to scan this QR code.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScanMessage;