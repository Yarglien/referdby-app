import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InviteQRCode } from "./InviteQRCode";

export const CreateInvite = () => {
  const [inviteType, setInviteType] = useState<string>("");
  const [inviteId, setInviteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateInvite = async () => {
    if (!inviteType) {
      toast({
        title: "Error",
        description: "Please select a role",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('invites')
        .insert({
          invite_type: inviteType,
          type: inviteType as any,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        })
        .select('id')
        .single();

      if (error) throw error;

      setInviteId(data.id);
      toast({
        title: "Success!",
        description: "Invite QR code created",
      });

    } catch (error: any) {
      console.error('Create invite error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (inviteId) {
    return <InviteQRCode inviteId={inviteId} inviteType={inviteType} />;
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create Invite</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Select value={inviteType} onValueChange={setInviteType}>
            <SelectTrigger>
              <SelectValue placeholder="Select role for invite" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="customer">Customer</SelectItem>
              <SelectItem value="server">Server</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleCreateInvite} className="w-full" disabled={loading}>
          {loading ? "Creating..." : "Create QR Code Invite"}
        </Button>
      </CardContent>
    </Card>
  );
};