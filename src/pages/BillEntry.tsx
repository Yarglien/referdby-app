
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Activity } from "@/integrations/supabase/types/activity.types";
import { RestaurantNav } from "@/components/RestaurantNav";
import { BillEntryLoading } from "@/components/bill/BillEntryLoading";
import { NoReferralState } from "@/components/bill/NoReferralState";
import { BillEntryForm } from "@/components/bill/BillEntryForm";
import { useBillActivity } from "@/hooks/useBillActivity";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const BillEntry = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const referral = location.state?.referral as Activity;
  
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      return data;
    },
  });

  const { data: activityData, isLoading } = useBillActivity(referral?.id);
  const { data: currentUser } = useCurrentUser();

  useEffect(() => {
    if (!profile && profile !== undefined) {
      navigate('/auth');
    } else if (profile?.role !== 'manager' && profile?.role !== 'server') {
      navigate('/');
    }
  }, [profile, navigate]);

  if (profile === undefined) {
    return <BillEntryLoading />;
  }

  if (!profile || (profile.role !== 'manager' && profile.role !== 'server')) {
    return null;
  }

  if (isLoading) {
    return <BillEntryLoading />;
  }

  if (!referral) {
    return <NoReferralState />;
  }

  return (
    <div className="min-h-screen bg-background pb-20 pt-safe-top">
      <header className="p-4 border-b">
        <h1 className="text-2xl font-bold">Bill Entry</h1>
      </header>

      <main className="p-4 space-y-6">
        <BillEntryForm 
          currentUser={currentUser} 
          activityData={activityData}
        />
      </main>

      <RestaurantNav />
    </div>
  );
};

export default BillEntry;
