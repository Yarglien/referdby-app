import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

interface Profile {
  role: string;
}

export const handleInviteCode = async (
  session: Session,
  profile: Profile,
  inviteCode: string,
  inviteType: string,
  navigate: (path: string) => void
): Promise<boolean> => {
  try {
    const { data: invite, error: inviteError } = await supabase
      .from("invites")
      .select('restaurant_id, created_by, type')
      .eq("invite_code", inviteCode)
      .single();

    if (inviteError) throw inviteError;

    if (!invite.restaurant_id || !invite.created_by) {
      throw new Error("Invalid invite: missing restaurant_id or referer_id");
    }

    const { error: updateInviteError } = await supabase
      .from("invites")
      .update({
        used_at: new Date().toISOString(),
        used_by: session.user.id,
      })
      .eq("invite_code", inviteCode);

    if (updateInviteError) throw updateInviteError;

    if (profile.role === 'customer') {
      const { error: profileUpdateError } = await supabase
        .from("profiles")
        .update({ 
          role: invite.type, // Use the type from the database
          restaurant_id: invite.restaurant_id,
          referer_id: invite.created_by
        })
        .eq("id", session.user.id);

      if (profileUpdateError) throw profileUpdateError;

      if (invite.type === 'manager') {
        navigate("/restaurant-manager");
        return true;
      } else if (invite.type === 'server') {
        navigate("/server-home");
        return true;
      }
    }
  } catch (error) {
    throw error;
  }
  return false;
};