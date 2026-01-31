
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { TokenState } from "@/utils/billing/types/billingTypes";
import { useTranslation } from "react-i18next";

interface ActiveTokensListProps {
  onPresentToken: (tokenId: string) => void;
}

export const ActiveTokensList = ({ onPresentToken }: ActiveTokensListProps) => {
  const { t } = useTranslation();
  const { data: activeTokens = [], isLoading } = useQuery({
    queryKey: ['active-roll-tokens'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('dice_tokens')
        .select('id, created_at, expires_at, restaurant_id, token_state, restaurants(name)')
        .eq('user_scanned_by', user.id)
        .eq('is_active', true)
        .eq('token_state', TokenState.USER_SCANNED)
        .lt('expires_at', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()) // Only show tokens that expire in the next 7 days
        .gt('expires_at', now) // Only show tokens that haven't expired yet
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching active tokens:', error);
        throw error;
      }
      
      console.log('Active tokens found:', data?.length);
      return data;
    },
    staleTime: 60000,
    refetchOnWindowFocus: true
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (activeTokens.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg bg-muted/20">
        <p className="text-muted-foreground">{t('rollToken.noActiveTokens')}</p>
        <p className="text-xs text-muted-foreground mt-2">{t('rollToken.visitRestaurant')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activeTokens.map((token: any) => (
        <div 
          key={token.id} 
          className="p-4 border rounded-lg space-y-2"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">{token.restaurants?.name || 'Restaurant'}</p>
              <p className="text-sm text-muted-foreground">
                Scanned: {new Date(token.created_at).toLocaleDateString()}
              </p>
            </div>
            <Button 
              onClick={() => onPresentToken(token.id)}
              className="bg-primary hover:bg-primary/90"
            >
              Present to Play
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Expires: {new Date(token.expires_at).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
};
