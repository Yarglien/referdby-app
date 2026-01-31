
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { RestaurantNav } from "@/components/RestaurantNav";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { isWithinRedemptionHours } from "@/utils/redemptionUtils";
import { RedeemLoading } from "@/components/redeem/RedeemLoading";
import { InvalidPoints } from "@/components/redeem/InvalidPoints";
import { RedeemForm } from "@/components/redeem/RedeemForm";

const RedeemEntry = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data: activityData, isLoading } = useQuery({
    queryKey: ['activity', id],
    queryFn: async () => {
      if (!id) throw new Error('No activity ID provided');

      const { data: activity, error } = await supabase
        .from('activities')
        .select(`
          *,
          user:profiles!activities_user_id_fkey (
            id,
            first_name,
            last_name,
            current_points
          ),
          scanner:profiles!activities_scanner_id_fkey (
            id,
            first_name,
            last_name
          ),
          restaurant:restaurants (
            id,
            name,
            current_points
          )
        `)
        .eq('id', id)
        .eq('type', 'redeem_scanned')
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error fetching activity:', error);
        throw error;
      }
      if (!activity) throw new Error('No active redemption activity found');
      
      console.log('Activity data:', activity);
      return activity;
    },
    enabled: !!id
  });

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      if (!profile) throw new Error('Profile not found');
      
      return profile;
    }
  });

  const checkRedemptionHours = async () => {
    if (!activityData?.restaurant_id) {
      throw new Error("Restaurant information not found");
    }
    // The isTakeaway parameter will be provided by the form component
    return true; // We'll let the useRedemptionForm handle the actual check
  };

  const handleSuccess = async () => {
    await queryClient.invalidateQueries();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/');
      return;
    }

    // Get user profile to determine correct navigation
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    // Navigate based on user role
    if (profile?.role === 'manager') {
      navigate('/restaurant-manager');
    } else {
      navigate('/server-home');
    }
  };

  if (isLoading) {
    return <RedeemLoading />;
  }

  if (!activityData?.user?.current_points) {
    return <InvalidPoints />;
  }

  return (
    <div className="min-h-screen bg-background pb-20 pt-safe-top">
      <header className="p-4 border-b flex items-center gap-4">
        <Link 
          to="/active-redeemers"
          className="text-primary hover:text-primary/80 transition-colors flex items-center gap-2 font-bold"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-2xl font-bold">Points Redemption</h1>
      </header>

      <main className="p-4 space-y-6">
        <RedeemForm 
          activityData={activityData}
          currentUser={currentUser}
          onSuccess={handleSuccess}
          checkRedemptionHours={checkRedemptionHours}
        />
      </main>

      <RestaurantNav />
    </div>
  );
};

export default RedeemEntry;
