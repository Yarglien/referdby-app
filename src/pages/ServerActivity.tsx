
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { ServerNav } from "@/components/ServerNav";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ActivityType } from "@/integrations/supabase/types/enums.types";

const ServerActivity = () => {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['server-activities'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          user:profiles!activities_user_id_fkey(
            id,
            first_name,
            last_name,
            name
          )
        `)
        .eq('processed_by_id', user.id)
        .in('type', [ActivityType.REFERRAL_PROCESSED, ActivityType.REDEEM_PROCESSED])
        .neq('type', 'referral_presented') // Filter out referral_presented activities
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // Helper function to determine activity title
  const getActivityTitle = (activity: any) => {
    if (activity.activity_type === 'roll_token_processed') {
      return "Roll for a Meal";
    }
    
    if (activity.type === ActivityType.REDEEM_PROCESSED || activity.points_redeemed > 0) {
      return "Points Redemption";
    }
    
    return activity.description || "Activity";
  };

  // Helper function to determine points value and sign
  const getPointsValue = (activity: any) => {
    // For redemptions - show as positive (green) values
    if (activity.type === ActivityType.REDEEM_PROCESSED || activity.points_redeemed > 0) {
      return { 
        value: Math.abs(activity.points_redeemed || 0), 
        isPositive: true
      };
    }
    
    // For regular meal purchases - show as negative (red) values
    if (activity.customer_points) {
      return {
        value: Math.abs(activity.customer_points),
        isPositive: false
      };
    }
    
    // Default fallback
    return { value: 0, isPositive: true };
  };

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  // Filter out referral_presented activities
  const filteredActivities = activities.filter(activity => activity.type !== 'referral_presented');

  return (
    <div className="min-h-screen pb-20 bg-background pt-safe-top">
      <header className="p-4 border-b flex items-center gap-4">
        <Link to="/server-home">
          <ArrowLeft className="w-6 h-6 text-muted-foreground" />
        </Link>
        <h1 className="text-2xl font-bold">Server Activity</h1>
      </header>

      <main className="p-4 space-y-6">
        {filteredActivities.length > 0 ? (
          filteredActivities.map((activity) => {
            const points = getPointsValue(activity);
            
            return (
              <Card key={activity.id} className="divide-y divide-border">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(activity.created_at), "HH:mm")}
                    </span>
                    <span className="font-medium">
                      {getActivityTitle(activity)}
                    </span>
                    {activity.user && (
                      <span className="text-sm text-muted-foreground">
                        Customer: {activity.user.first_name} {activity.user.last_name || activity.user.name}
                      </span>
                    )}
                    
                    {/* For Roll Token, show Win/Lose and bill amount */}
                    {activity.activity_type === 'roll_token_processed' && (
                      <span className="text-sm text-muted-foreground">
                        {activity.amount_spent > 0 ? 'Lost' : 'Won'} • 
                        Bill Amount: ${Math.abs(activity.amount_spent || 0).toFixed(2)}
                      </span>
                    )}
                    
                    {/* For regular meal purchases */}
                    {activity.amount_spent && activity.activity_type !== 'roll_token_processed' && (
                      <span className="text-sm text-muted-foreground">
                        Bill Amount: ${activity.amount_spent.toFixed(2)}
                      </span>
                    )}
                    
                    {/* For points redemption, show points redeemed */}
                    {activity.type === 'redeem_processed' && activity.points_redeemed > 0 && (
                      <span className="text-sm text-muted-foreground">
                        Points Redeemed: {activity.points_redeemed}
                      </span>
                    )}
                  </div>
                  <span className={`font-medium ${points.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {points.isPositive ? `+${points.value}` : `-${points.value}`}
                  </span>
                </div>
              </Card>
            );
          })
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No activity yet.
          </div>
        )}
      </main>

      <ServerNav />
    </div>
  );
};

export default ServerActivity;
