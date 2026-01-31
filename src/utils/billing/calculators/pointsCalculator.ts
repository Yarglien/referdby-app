
import { supabase } from "@/integrations/supabase/client";
import { PointsDistribution } from "@/utils/billing/types/billingTypes";

export const calculatePoints = async (billAmount: number): Promise<PointsDistribution> => {
  console.log('Calculating points for bill amount:', billAmount);
  
  // Fetch active points allocation percentages
  const { data: allocations, error: allocationError } = await supabase
    .from('points_allocation')
    .select('*')
    .eq('is_active', true);

  if (allocationError) {
    console.error('Error fetching points allocations:', allocationError);
    throw new Error('Failed to fetch points allocation rules');
  }

  if (!allocations || allocations.length === 0) {
    console.error('No points allocation rules found');
    throw new Error('No points allocation rules found');
  }

  const getPercentage = (type: string): number => {
    const allocation = allocations.find(a => a.type === type);
    if (!allocation) {
      console.error(`No allocation rule found for type: ${type}`);
      throw new Error(`Missing allocation rule for: ${type}`);
    }
    return allocation.percentage;
  };

  // Calculate points with 2 decimal precision
  const points = {
    customerPoints: Number((billAmount * (getPercentage('customer') / 100)).toFixed(2)),
    referrerPoints: Number((billAmount * (getPercentage('referrer') / 100)).toFixed(2)),
    restaurantRecruiterPoints: Number((billAmount * (getPercentage('restaurant_recruiter') / 100)).toFixed(2)),
    appReferrerPoints: Number((billAmount * (getPercentage('app_referrer') / 100)).toFixed(2)),
    restaurantDeduction: Number((billAmount * (getPercentage('restaurant_deduction') / 100)).toFixed(2)),
    // Add the missing required properties
    restaurantPoints: 0, // This appears to be unused but required by the interface
    refererPoints: Number((billAmount * (getPercentage('referrer') / 100)).toFixed(2)), // Same as referrerPoints for compatibility
  };

  console.log('Calculated points distribution:', points);
  return points;
};

// Helper function to format points for display
export const formatPointsForDisplay = (points: number | null | undefined): string => {
  if (points === null || points === undefined) return '0';
  return Math.ceil(Number(points)).toString();
};
