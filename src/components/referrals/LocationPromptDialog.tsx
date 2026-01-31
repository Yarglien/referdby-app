import { MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface LocationPromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationPromptDialog = ({
  isOpen,
  onClose,
}: LocationPromptDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Location Not Available
          </DialogTitle>
          <DialogDescription className="pt-2">
            Please enter a restaurant name or location address, or city/town you are interested in within the search bar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <p className="text-sm text-muted-foreground">
            <strong>Tip:</strong> To prevent this popup in future, enable location services in your device settings for automatic location detection.
          </p>

          <Button onClick={onClose} className="w-full">
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
