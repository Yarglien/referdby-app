import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ReferralDataFetcherProps {
  children: (data: {
    activeReferrals: any[];
    usedReferrals: any[];
    isLoading: boolean;
    error: string | null;
  }) => React.ReactNode;
}

export const ReferralDataFetcher = ({ children }: ReferralDataFetcherProps) => {
  const [activeReferrals, setActiveReferrals] = useState<any[]>([]);
  const [usedReferrals, setUsedReferrals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError("User not authenticated");
          return;
        }

        console.log('=== Fetching My Referrals ===', {
          userId: user.id,
          timestamp: new Date().toISOString()
        });

        // Execute both queries in parallel for faster loading
        const [activeResult, presentedResult, usedResult] = await Promise.all([
          // Fetch active referrals you've claimed from others (scanned - ready to visit)
          supabase
            .from('referrals')
            .select(`
              *,
              creator:creator_id (
                id,
                first_name,
                last_name,
                photo
              ),
              restaurant:restaurant_id (
                id,
                name,
                photos,
                address,
                cuisine_type,
                latitude,
                longitude
              ),
              external_restaurant:external_restaurant_id (
                id,
                name,
                photos,
                address,
                cuisine_type,
                latitude,
                longitude
              )
            `)
            .eq('scanned_by_id', user.id)
            .eq('status', 'scanned')
            .order('scanned_at', { ascending: false }),

          // Fetch presented referrals (greyed out - restaurant has scanned activity)
          supabase
            .from('referrals')
            .select(`
              *,
              creator:creator_id (
                id,
                first_name,
                last_name,
                photo
              ),
              restaurant:restaurant_id (
                id,
                name,
                photos,
                address,
                cuisine_type,
                latitude,
                longitude
              ),
              external_restaurant:external_restaurant_id (
                id,
                name,
                photos,
                address,
                cuisine_type,
                latitude,
                longitude
              )
            `)
            .eq('scanned_by_id', user.id)
            .eq('status', 'presented')
            .order('scanned_at', { ascending: false }),

          // Fetch used referrals you've claimed from others
          supabase
            .from('referrals')
            .select(`
              *,
              creator:creator_id (
                id,
                first_name,
                last_name,
                photo
              ),
              restaurant:restaurant_id (
                id,
                name,
                photos,
                address,
                cuisine_type,
                latitude,
                longitude
              ),
              external_restaurant:external_restaurant_id (
                id,
                name,
                photos,
                address,
                cuisine_type,
                latitude,
                longitude
              )
            `)
            .eq('scanned_by_id', user.id)
            .eq('status', 'used')
            .order('scanned_at', { ascending: false })
        ]);

        const { data: activeData, error: activeError } = activeResult;
        const { data: presentedData, error: presentedError } = presentedResult;
        const { data: usedData, error: usedError } = usedResult;

        if (activeError || presentedError || usedError) {
          console.error('Error fetching referrals:', activeError || presentedError || usedError);
          setError("Failed to fetch referrals");
          toast.error("Failed to fetch referrals");
          return;
        }

        // Combine active and presented referrals for the active list
        const combinedActiveData = [...(activeData || []), ...(presentedData || [])];

        console.log('🔍 Fetched referrals:', { 
          active: activeData, 
          presented: presentedData,
          used: usedData,
          activeCount: activeData?.length || 0,
          presentedCount: presentedData?.length || 0,
          usedCount: usedData?.length || 0
        });
        
        setActiveReferrals(combinedActiveData);
        setUsedReferrals(usedData || []);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError("An unexpected error occurred");
        toast.error("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReferrals();
  }, []);

  return <>{children({ activeReferrals, usedReferrals, isLoading, error })}</>;
};