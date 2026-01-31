
import { useState, useEffect } from "react";
import { Schedule } from "@/integrations/supabase/types/activity.types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { createUpdatedSchedule, DEFAULT_SCHEDULE } from "@/utils/scheduleUtils";

export interface RestaurantScheduleData {
  restaurantId: string | null;
  redemptionPercentage: number;
  dineInSchedule: Schedule[];
  takeAwaySchedule: Schedule[];
  openingHoursSchedule: Schedule[];
  usesSameSchedule: boolean;
  isLoading: boolean;
  error: Error | null;
}

export const useRestaurantSchedule = (
  navigateOnError: () => void
): RestaurantScheduleData => {
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [redemptionPercentage, setRedemptionPercentage] = useState<number>(50);
  const [dineInSchedule, setDineInSchedule] = useState<Schedule[]>(DEFAULT_SCHEDULE);
  const [takeAwaySchedule, setTakeAwaySchedule] = useState<Schedule[]>(DEFAULT_SCHEDULE);
  const [openingHoursSchedule, setOpeningHoursSchedule] = useState<Schedule[]>(DEFAULT_SCHEDULE);
  const [usesSameSchedule, setUsesSameSchedule] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchSchedule = async () => {
      if (!isMounted) return;
      
      try {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          if (isMounted) {
            toast.error("Please sign in to view redemption profile");
            navigateOnError();
          }
          return;
        }

        const { data: restaurant, error: fetchError } = await supabase
          .from('restaurants')
          .select('id, redemption_schedule, takeaway_redemption_schedule, max_redemption_percentage, uses_same_redemption_schedule, opening_hours_schedule')
          .eq('manager_id', user.id)
          .single();
          
        if (fetchError) {
          console.error('Error fetching restaurant:', fetchError.message);
          if (isMounted) {
            setError(new Error(fetchError.message));
            toast.error("Failed to load restaurant data");
          }
          return;
        }

        if (restaurant && isMounted) {
          setRestaurantId(restaurant.id);
          setRedemptionPercentage(restaurant.max_redemption_percentage ?? 50);
          setUsesSameSchedule(restaurant.uses_same_redemption_schedule ?? true);
          
          // Set opening hours schedule
          const openingHours = restaurant.opening_hours_schedule && Array.isArray(restaurant.opening_hours_schedule) && restaurant.opening_hours_schedule.length > 0
            ? createUpdatedSchedule(restaurant.opening_hours_schedule as Schedule[])
            : DEFAULT_SCHEDULE;
          
          setOpeningHoursSchedule(openingHours);
          
          // Use opening hours as default if no redemption schedule exists
          let defaultSchedule = openingHours;
          
          const updatedDineInSchedule = restaurant.redemption_schedule && Array.isArray(restaurant.redemption_schedule) && restaurant.redemption_schedule.length > 0
            ? createUpdatedSchedule(restaurant.redemption_schedule as Schedule[])
            : defaultSchedule;
          
          setDineInSchedule(updatedDineInSchedule);

          if (restaurant.takeaway_redemption_schedule && Array.isArray(restaurant.takeaway_redemption_schedule) && restaurant.takeaway_redemption_schedule.length > 0) {
            setTakeAwaySchedule(createUpdatedSchedule(restaurant.takeaway_redemption_schedule as Schedule[]));
          } else {
            setTakeAwaySchedule(updatedDineInSchedule);
          }
        }
      } catch (catchError) {
        console.error('Error loading redemption profile:', catchError);
        if (isMounted) {
          setError(catchError instanceof Error ? catchError : new Error('Unknown error'));
          toast.error("Failed to load redemption profile");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchSchedule();
    
    return () => {
      isMounted = false;
    };
  }, [navigateOnError]);

  return {
    restaurantId,
    redemptionPercentage,
    dineInSchedule,
    takeAwaySchedule,
    openingHoursSchedule,
    usesSameSchedule,
    isLoading,
    error
  };
};
