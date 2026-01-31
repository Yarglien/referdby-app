
import { useState, useEffect, useCallback, useRef } from "react";
import { Schedule } from "@/integrations/supabase/types/activity.types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { updateScheduleDay, DEFAULT_SCHEDULE, calculateWeeklyHours } from "@/utils/scheduleUtils";
import { useRestaurantSchedule } from "@/hooks/useRestaurantSchedule";

interface UseRedemptionScheduleReturn {
  restaurantId: string | null;
  redemptionPercentage: number;
  dineInSchedule: Schedule[];
  takeAwaySchedule: Schedule[];
  usesSameSchedule: boolean;
  handleToggleDineInDay: (day: string) => void;
  handleToggleTakeAwayDay: (day: string) => void;
  handleDineInTimeChange: (day: string, type: 'open_time' | 'close_time', value: string) => void;
  handleTakeAwayTimeChange: (day: string, type: 'open_time' | 'close_time', value: string) => void;
  handleScheduleTypeChange: (isSame: boolean) => void;
  setRedemptionPercentage: (value: number) => void;
  handleSave: () => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export const useRedemptionSchedule = (
  navigateOnSave: () => void
): UseRedemptionScheduleReturn => {
  const dataLoaded = useRef(false);
  
  const {
    restaurantId,
    redemptionPercentage: initialPercentage,
    dineInSchedule: initialDineInSchedule,
    takeAwaySchedule: initialTakeAwaySchedule,
    openingHoursSchedule,
    usesSameSchedule: initialUsesSameSchedule,
    isLoading: isDataLoading,
    error: dataError
  } = useRestaurantSchedule(() => {
    // Don't navigate on initial error since we manage navigation separately
  });

  const [redemptionPercentage, setRedemptionPercentage] = useState<number>(50);
  const [dineInSchedule, setDineInSchedule] = useState<Schedule[]>(DEFAULT_SCHEDULE);
  const [takeAwaySchedule, setTakeAwaySchedule] = useState<Schedule[]>(DEFAULT_SCHEDULE);
  const [usesSameSchedule, setUsesSameSchedule] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Update state from fetched data only once loading is complete and only if data hasn't been loaded yet
  useEffect(() => {
    if (!isDataLoading && !dataError && !dataLoaded.current) {
      setRedemptionPercentage(initialPercentage);
      setDineInSchedule(initialDineInSchedule);
      setTakeAwaySchedule(initialTakeAwaySchedule);
      setUsesSameSchedule(initialUsesSameSchedule);
      dataLoaded.current = true;
    }
  }, [isDataLoading, dataError, initialPercentage, initialDineInSchedule, initialTakeAwaySchedule, initialUsesSameSchedule]);

  // Sync takeaway schedule with dine-in when usesSameSchedule is true
  useEffect(() => {
    if (usesSameSchedule && dataLoaded.current) {
      setTakeAwaySchedule([...dineInSchedule]);
    }
  }, [usesSameSchedule, dineInSchedule]);

  // Helper function to validate hour reduction
  const validateHourReduction = useCallback((newSchedule: Schedule[], scheduleType: string): boolean => {
    const openingHours = calculateWeeklyHours(openingHoursSchedule);
    const redemptionHours = calculateWeeklyHours(newSchedule);
    const hourDifference = openingHours - redemptionHours;
    
    if (hourDifference > 20) {
      toast.error(`Cannot reduce ${scheduleType} redemption hours by more than 20 hours per week compared to opening hours. Current reduction would be ${Math.round(hourDifference)} hours.`);
      return false;
    }
    return true;
  }, [openingHoursSchedule]);

  const handleToggleDineInDay = useCallback((day: string) => {
    setDineInSchedule(prev => {
      const updatedSchedule = updateScheduleDay(prev, day, { 
        is_open: !prev.find(d => d.day_of_week === day)?.is_open 
      });
      
      // Validate hour reduction
      if (!validateHourReduction(updatedSchedule, 'dine-in')) {
        return prev;
      }
      
      return updatedSchedule;
    });
  }, [validateHourReduction]);

  const handleToggleTakeAwayDay = useCallback((day: string) => {
    if (usesSameSchedule) return;
    
    setTakeAwaySchedule(prev => {
      const updatedSchedule = updateScheduleDay(prev, day, { 
        is_open: !prev.find(d => d.day_of_week === day)?.is_open 
      });
      
      // Validate hour reduction
      if (!validateHourReduction(updatedSchedule, 'takeaway')) {
        return prev;
      }
      
      return updatedSchedule;
    });
  }, [usesSameSchedule, validateHourReduction]);

  const handleDineInTimeChange = useCallback((day: string, type: 'open_time' | 'close_time', value: string) => {
    setDineInSchedule(prev => {
      const updatedSchedule = updateScheduleDay(prev, day, { [type]: value });
      
      // Validate hour reduction
      if (!validateHourReduction(updatedSchedule, 'dine-in')) {
        return prev;
      }
      
      return updatedSchedule;
    });
  }, [validateHourReduction]);

  const handleTakeAwayTimeChange = useCallback((day: string, type: 'open_time' | 'close_time', value: string) => {
    if (usesSameSchedule) return;
    
    setTakeAwaySchedule(prev => {
      const updatedSchedule = updateScheduleDay(prev, day, { [type]: value });
      
      // Validate hour reduction
      if (!validateHourReduction(updatedSchedule, 'takeaway')) {
        return prev;
      }
      
      return updatedSchedule;
    });
  }, [usesSameSchedule, validateHourReduction]);

  const handleScheduleTypeChange = useCallback((isSame: boolean) => {
    setUsesSameSchedule(isSame);
  }, []);

  const saveSchedule = useCallback(async () => {
    if (!restaurantId) {
      throw new Error("No restaurant found");
    }

    const updateData = {
      redemption_schedule: dineInSchedule,
      max_redemption_percentage: redemptionPercentage,
      uses_same_redemption_schedule: usesSameSchedule,
      takeaway_redemption_schedule: usesSameSchedule 
        ? dineInSchedule
        : takeAwaySchedule
    };

    const { error } = await supabase
      .from('restaurants')
      .update(updateData)
      .eq('id', restaurantId);

    if (error) throw error;
  }, [restaurantId, dineInSchedule, redemptionPercentage, usesSameSchedule, takeAwaySchedule]);

  const handleSave = useCallback(async () => {
    try {
      setIsSaving(true);
      await saveSchedule();
      toast.success("Redemption profile saved successfully");
      navigateOnSave();
    } catch (error) {
      console.error('Error saving redemption profile:', error);
      toast.error("Failed to save redemption profile");
    } finally {
      setIsSaving(false);
    }
  }, [saveSchedule, navigateOnSave]);

  // Combine loading states - only show loading when initial data is being fetched
  const isLoading = (isDataLoading && !dataLoaded.current) || isSaving;

  return {
    restaurantId,
    redemptionPercentage,
    dineInSchedule,
    takeAwaySchedule,
    usesSameSchedule,
    handleToggleDineInDay,
    handleToggleTakeAwayDay,
    handleDineInTimeChange,
    handleTakeAwayTimeChange,
    handleScheduleTypeChange,
    setRedemptionPercentage,
    handleSave,
    isLoading,
    error: dataError
  };
};
