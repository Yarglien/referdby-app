
import { useState } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/BottomNav";
import { InviteHeader } from "@/components/invites/InviteHeader";
import { InviteQRCode } from "@/components/invites/InviteQRCode";
import { InviteInfoDialog } from "@/components/invites/InviteInfoDialog";
import { useInviteCodes } from "@/hooks/useInviteCodes";

const InviteOthers = () => {
  const [showInfo, setShowInfo] = useState(false);
  const { userInviteCode, restaurantInviteCode, isLoading } = useInviteCodes();

  const handleInfoOpen = () => setShowInfo(true);
  const handleInfoClose = (open: boolean) => setShowInfo(open);

  // Show loading state if still loading and no codes available yet
  const showLoadingState = isLoading && !userInviteCode && !restaurantInviteCode;

  return (
    <div className="min-h-screen bg-background pb-20 pt-safe-top">
      <InviteHeader />

      <div className="p-6 max-w-md mx-auto space-y-8">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-xl font-medium">
            Your Invite Codes
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleInfoOpen}
          >
            <Info className="h-5 w-5 text-primary" />
          </Button>
        </div>

        {showLoadingState ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading invite codes...</p>
          </div>
        ) : (
          <>
            {/* User Invite Section */}
            <InviteQRCode 
              inviteCode={userInviteCode} 
              type="User" 
              isLoading={isLoading} 
            />

            {/* Restaurant Invite Section */}
            <InviteQRCode 
              inviteCode={restaurantInviteCode} 
              type="Restaurant" 
              isLoading={isLoading} 
            />
          </>
        )}
      </div>

      <InviteInfoDialog 
        open={showInfo} 
        onOpenChange={handleInfoClose} 
      />
      
      <BottomNav />
    </div>
  );
};

export default InviteOthers;
