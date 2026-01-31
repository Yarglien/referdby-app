
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface RedeemInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RedeemInfoDialog = ({ open, onOpenChange }: RedeemInfoDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>How to Redeem Your Points</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="font-semibold">Check Restaurant Redemption Schedule:</p>
            <p>Before you go to the restaurant, make sure it is currently accepting redemptions.</p>
          </div>

          <div>
            <p className="font-semibold">Generate your QR Code:</p>
            <p>Enter the restaurant's name and location in the app and click "Generate Redeem QR Code."</p>
          </div>

          <div>
            <p className="font-semibold">Present QR Code at Restaurant:</p>
            <p>When you arrive, present the QR code to the restaurant staff for scanning.</p>
          </div>

          <div>
            <p className="font-semibold">How Many Points to Redeem:</p>
            <p>When you get your bill, let your server know how many points you want to redeem.</p>
          </div>

          <div>
            <p className="font-semibold">Enjoy Your Discount:</p>
            <p>Each point you redeem will take $1 off your food and drink bill.</p>
          </div>

          <div className="text-red-600">
            <p className="font-semibold">Important Note:</p>
            <p>The point redemption discount only applies to the cost of the food and drinks. Service charges and tips are not included.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
