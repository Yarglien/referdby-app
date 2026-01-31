
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ActiveRollerItem } from "./ActiveRollerItem";
import { ActiveRollersEmptyState } from "./ActiveRollersEmptyState";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TokenState } from "@/integrations/supabase/types/enums.types";

interface ActiveRollersListProps {
  recentlyScannedToken?: string;
  restaurantId: string;
}

export const ActiveRollersList = ({ recentlyScannedToken, restaurantId }: ActiveRollersListProps) => {
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Debug log of restaurant ID
  useEffect(() => {
    console.log('ActiveRollersList mounted with restaurant ID:', restaurantId);
  }, [restaurantId]);

  const { 
    data: activeTokens = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['active-rollers', restaurantId],
    queryFn: async () => {
      try {
        console.log('Starting active rollers query execution for restaurant:', restaurantId);
        
        // Query for tokens in the present_at_restaurant state using TokenState enum
        const { data, error: tokensError } = await supabase
          .from('dice_tokens')
          .select(`
            id,
            created_at,
            user_scanned_at,
            user_scanned_by,
            restaurant_scanned_at,
            token_state,
            expires_at,
            profiles:user_scanned_by (
              id,
              first_name,
              last_name,
              email
            )
          `)
          .eq('restaurant_id', restaurantId)
          .eq('is_active', true)
          .eq('token_state', TokenState.PRESENT_AT_RESTAURANT)
          .order('restaurant_scanned_at', { ascending: false });

        if (tokensError) {
          console.error('Error fetching active tokens:', tokensError);
          setFetchError(tokensError.message);
          throw tokensError;
        }

        console.log('Active rollers query result:', {
          count: data?.length,
          restaurantId: restaurantId,
          tokens: data
        });
        
        return data || [];
      } catch (error: any) {
        console.error('Error in active rollers query function:', error);
        setFetchError(error.message);
        throw error;
      }
    },
    staleTime: 10000, // 10 seconds stale time
    refetchInterval: 60000, // Reduced to once per minute to prevent excessive queries
    refetchOnWindowFocus: true,
    retry: 1
  });

  useEffect(() => {
    if (error) {
      console.error('Error in active rollers query:', error);
      toast.error('Failed to load active roll tokens');
    }
  }, [error]);

  // Force immediate refetch if a new token was just scanned
  useEffect(() => {
    if (recentlyScannedToken) {
      console.log('Recently scanned token detected, refreshing list:', recentlyScannedToken);
      refetch();
    }
  }, [recentlyScannedToken, refetch]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  console.log('Rendering ActiveRollersList with tokens:', {
    count: activeTokens?.length,
    restaurantId: restaurantId,
    tokensData: activeTokens
  });

  if (!activeTokens || activeTokens.length === 0) {
    return (
      <div>
        {fetchError ? (
          <div className="text-center py-4 text-red-500">
            <p>Error loading active tokens: {fetchError}</p>
            <button 
              onClick={() => refetch()} 
              className="mt-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <ActiveRollersEmptyState />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activeTokens.map((token: any) => (
        <ActiveRollerItem 
          key={token.id}
          token={token}
          onProcessed={refetch}
          highlightToken={token.id === recentlyScannedToken}
        />
      ))}
    </div>
  );
};
