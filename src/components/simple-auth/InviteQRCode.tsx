import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InviteQRCodeProps {
  inviteId: string;
  inviteType: string;
}

export const InviteQRCode = ({ inviteId, inviteType }: InviteQRCodeProps) => {
  const inviteUrl = `${window.location.origin}/signup?invite=${inviteId}`;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Invite QR Code</CardTitle>
        <p className="text-sm text-muted-foreground">
          Role: {inviteType.charAt(0).toUpperCase() + inviteType.slice(1)}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <QRCodeSVG 
          value={inviteUrl}
          size={200}
          level="M"
        />
        <p className="text-xs text-center text-muted-foreground">
          Scan this QR code to join ReferdBy
        </p>
        <p className="text-xs text-center font-mono bg-muted p-2 rounded">
          {inviteUrl}
        </p>
      </CardContent>
    </Card>
  );
};