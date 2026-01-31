
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface InviteInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InviteInfoDialog = ({ open, onOpenChange }: InviteInfoDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>About Inviting Others</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground">
          When you invite a user or a restaurant to Referedby you not only improve 
          the community, but you also earn points for every meal the user or restaurant 
          processes through ReferdBy. So go talk to your favourite restaurant and get 
          them signed up, similarly, if anyone asks for a recommendation - sign them up!
        </p>
      </DialogContent>
    </Dialog>
  );
};
