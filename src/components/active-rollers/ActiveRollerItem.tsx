
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { TokenState } from "@/integrations/supabase/types/enums.types";

interface ActiveRollerItemProps {
  token: {
    id: string;
    profiles?: {
      first_name?: string;
      last_name?: string;
      email?: string;
    };
    restaurant_scanned_at: string;
    user_scanned_at: string;
    token_state: string;
  };
  onProcessed: () => void;
  highlightToken?: boolean;
}

export const ActiveRollerItem = ({ token, onProcessed, highlightToken }: ActiveRollerItemProps) => {
  const [processing, setProcessing] = useState(false);

  const handleProcessToken = async () => {
    try {
      setProcessing(true);

      // First check if token is still valid and in the correct state
      const { data: tokenData, error: fetchError } = await supabase
        .from('dice_tokens')
        .select('token_state')
        .eq('id', token.id)
        .eq('is_active', true)
        .maybeSingle();
        
      if (fetchError || !tokenData) {
        toast.error('Unable to validate token');
        setProcessing(false);
        return;
      }
      
      if (tokenData.token_state !== TokenState.PRESENT_AT_RESTAURANT) {
        if (tokenData.token_state === TokenState.PROCESSED) {
          toast.error('This token has already been processed');
        } else {
          toast.error('This token is not ready for processing');
        }
        setProcessing(false);
        onProcessed(); // Refresh the list
        return;
      }

      // Simulate dice roll (1-6)
      const diceRoll = Math.floor(Math.random() * 6) + 1;
      
      // Determine if they won (e.g., if roll is 6)
      const isWinner = diceRoll === 6;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Authentication required');
        setProcessing(false);
        return;
      }

      // Update token state to processed
      const { error: updateError } = await supabase
        .from('dice_tokens')
        .update({
          token_state: TokenState.PROCESSED,
          processed_at: new Date().toISOString(),
          processed_by: user.id,
          used_at: new Date().toISOString()
        })
        .eq('id', token.id)
        .eq('is_active', true)
        .eq('token_state', TokenState.PRESENT_AT_RESTAURANT);

      if (updateError) {
        console.error('Error processing token:', updateError);
        toast.error('Failed to process roll');
        setProcessing(false);
        return;
      }

      // Show result with appropriate message
      if (isWinner) {
        toast.success(`🎲 Rolled a ${diceRoll}! Customer wins a free meal!`);
      } else {
        toast.info(`🎲 Rolled a ${diceRoll}. Better luck next time!`);
      }
      
      // Trigger refresh
      onProcessed();
    } catch (error: any) {
      console.error('Error processing roll:', error);
      toast.error(error.message || 'Failed to process roll');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div 
      className={`p-4 border rounded-lg space-y-2 ${
        highlightToken ? 'border-primary bg-primary/10 dark:bg-primary/20' : ''
      }`}
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="font-medium">
            {token.profiles?.first_name} {token.profiles?.last_name}
          </p>
          <p className="text-sm text-muted-foreground">
            Presented: {new Date(token.restaurant_scanned_at).toLocaleTimeString()}
          </p>
        </div>
        <Button 
          onClick={handleProcessToken}
          className="bg-primary hover:bg-primary/90"
          disabled={processing}
        >
          Process Roll
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Token ID: {token.id}
      </p>
    </div>
  );
};
