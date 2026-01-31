
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { InvalidInvite } from "./InvalidInvite";
import { LoadingInvite } from "./LoadingInvite";

interface InviteValidatorProps {
  inviteCode: string | null;
  children: React.ReactNode;
}

export const InviteValidator = ({ inviteCode, children }: InviteValidatorProps) => {
  const [isInviteValid, setIsInviteValid] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
  const checkInviteValidity = async () => {
      console.log('Checking invite validity for code:', inviteCode);
      
      if (!inviteCode) {
        console.log('No invite code provided, setting valid to true');
        setIsInviteValid(true);
        return;
      }

      try {
        // Check if this is an invite ID (UUID format) or old style code
        const isInviteId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(inviteCode);
        
        if (isInviteId) {
          console.log('Checking invite by ID...');
          // New system: check by invite ID
          const { data: invite, error } = await supabase
            .from("invites")
            .select("*")
            .eq("id", inviteCode)
            .gt("expires_at", new Date().toISOString())
            .limit(1);

          console.log('Invite ID check result:', { invite, error });

          if (error || !invite || invite.length === 0) {
            console.log('Invite ID validation failed:', { error, invite });
            setIsInviteValid(false);
            toast({
              title: "Invalid Invite",
              description: "This invite is invalid or has expired. Please request a new invite.",
              variant: "destructive",
            });
          } else {
            console.log('Invite ID is valid');
            setIsInviteValid(true);
          }
        } else {
          // Old system: check permanent codes and one-time codes
          console.log('Checking permanent codes...');
          const { data: permanentInvites, error: permanentError } = await supabase
            .from("invites")
            .select("id")
            .eq("permanent_code", inviteCode)
            .limit(1);

          console.log('Permanent invite check result:', { permanentInvites, permanentError });

          if (!permanentError && permanentInvites && permanentInvites.length > 0) {
            // Found a valid permanent code
            setIsInviteValid(true);
            return;
          }

          // If not a permanent code, check for a one-time invite code
          console.log('Checking one-time codes...');
          const { data: oneTimeInvites, error } = await supabase
            .from("invites")
            .select("*")
            .eq("invite_code", inviteCode)
            .is("used_at", null)
            .gt("expires_at", new Date().toISOString())
            .limit(1);

          console.log('One-time invite check result:', { oneTimeInvites, error });

          if (error || !oneTimeInvites || oneTimeInvites.length === 0) {
            console.log('Invite validation failed:', { error, oneTimeInvites });
            setIsInviteValid(false);
            toast({
              title: "Invalid Invite",
              description: "This invite has already been used or has expired. Please request a new invite.",
              variant: "destructive",
            });
          } else {
            console.log('Invite is valid');
            setIsInviteValid(true);
          }
        }
      } catch (error) {
        console.error("Error checking invite:", error);
        setIsInviteValid(false);
        toast({
          title: "Error",
          description: "Failed to validate invite. Please try again.",
          variant: "destructive",
        });
      }
    };

    checkInviteValidity();
  }, [inviteCode, toast]);

  if (isInviteValid === false) {
    return <InvalidInvite />;
  }

  if (isInviteValid === null) {
    return <LoadingInvite />;
  }

  return <>{children}</>;
};
