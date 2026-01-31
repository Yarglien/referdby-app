
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ReferralQRDialog } from "@/components/ReferralQRDialog";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { toast } from "sonner";

interface InviteGeneratorProps {
  restaurantId: string;
  inviteType?: 'server' | 'manager';
}

export const InviteGenerator = ({ restaurantId, inviteType = 'server' }: InviteGeneratorProps) => {
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const { supabase } = useSupabase();

  const handleGenerateInvite = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      if (!user) {
        toast.error("You must be logged in to create invites");
        return;
      }

      const newInviteCode = crypto.randomUUID();
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);

      const { error: insertError } = await supabase
        .from('invites')
        .insert({
          invite_code: newInviteCode,
          type: inviteType,
          invite_type: inviteType, // Add the required invite_type field
          created_by: user.id,
          expires_at: expiryDate.toISOString(),
          restaurant_id: restaurantId,
        });

      if (insertError) {
        console.error('Error creating invite:', insertError);
        toast.error("Failed to create invite");
        return;
      }

      setInviteCode(newInviteCode);
      setShowQRDialog(true);
      toast.success(`${inviteType === 'manager' ? 'Manager' : 'Server'} invite QR code generated successfully`);
    } catch (error) {
      console.error('Error:', error);
      toast.error("Something went wrong");
    }
  };

  return (
    <>
      <section>
        <h2 className="text-lg font-medium mb-4">
          Invite a New {inviteType === 'manager' ? 'Manager' : 'Server'}
        </h2>
        <Button 
          onClick={handleGenerateInvite}
          className="bg-primary text-white w-auto"
        >
          Generate {inviteType === 'manager' ? 'Manager' : 'Server'} Invite QR Code
        </Button>
      </section>

      <ReferralQRDialog
        isOpen={showQRDialog}
        onClose={() => setShowQRDialog(false)}
        referralCode={inviteCode}
        type="invite"
      />
    </>
  );
};
