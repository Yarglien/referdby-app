
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useAccountDeletion } from "@/services/accountDeletion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DangerZoneProps {
  userRole: string | null;
}

export const DangerZone = ({ userRole }: DangerZoneProps) => {
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteAccount } = useAccountDeletion();

  // Servers should not have access to delete their own accounts
  if (userRole === 'server') {
    return null;
  }

  const handleLeaveReferdBy = async () => {
    try {
      setIsDeleting(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("You must be logged in to delete your account");
      }
      
      await deleteAccount({
        userRole,
        userId: user.id
      });
      
    } catch (error) {
      console.error('Error in handleLeaveReferdBy:', error);
    } finally {
      setIsDeleting(false);
      setIsLeaveDialogOpen(false);
    }
  };

  return (
    <div className="pt-6 mt-6 border-t border-destructive/20">
      <h2 className="text-lg font-semibold text-destructive pb-2">Danger Zone</h2>
      <p className="text-sm text-muted-foreground mb-4">
        {userRole === 'manager' 
          ? "Permanently delete your account and associated profile and restaurant data."
          : "Permanently delete your account and associated profile data."
        }
      </p>
      
      <AlertDialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
        <AlertDialogTrigger asChild>
          <div className="flex justify-center">
            <Button variant="destructive" className="w-auto shadow-sm hover:shadow-md transition-shadow">
              Leave ReferdBy
            </Button>
          </div>
        </AlertDialogTrigger>
        <AlertDialogContent className="border border-destructive/20">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              We would be really sad to see you go! This action cannot be undone.
              {userRole === 'manager' ? (
                <span className="block mt-2 font-semibold text-destructive">
                  Warning: This will permanently delete your restaurant and all associated data.
                </span>
              ) : (
                <span className="block mt-2 text-muted-foreground">
                  Your data will be anonymized to protect your privacy while preserving referral history.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="border border-input hover:bg-accent/80">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLeaveReferdBy} 
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Yes, delete my account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
