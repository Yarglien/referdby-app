import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Server {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
}

interface RemoveServerDialogProps {
  server: Server | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const RemoveServerDialog = ({ server, onClose, onConfirm }: RemoveServerDialogProps) => {
  return (
    <AlertDialog open={server !== null} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Server</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove {server?.name || 'this server'} as a server? 
            They will no longer be able to process data for the restaurant.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Remove Server
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};