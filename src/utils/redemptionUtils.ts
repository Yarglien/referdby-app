
import { supabase } from "@/integrations/supabase/client";
import {
  getRestaurantLocalTime,
  getAppropriateSchedule,
  isTimeWithinSchedule,
  mapJsonToSchedule
} from "./redemption/scheduleHelpers";

export const isWithinRedemptionHours = async (restaurantId: string, isTakeAway: boolean = false) => {
  // Get restaurant timezone, opening hours, and redemption schedule
  const { data: restaurant, error } = await supabase
    .from('restaurants')
    .select('timezone, opening_hours_schedule, redemption_schedule, takeaway_redemption_schedule, uses_same_redemption_schedule')
    .eq('id', restaurantId)
    .single();

  if (error) {
    console.error('Error fetching restaurant data:', error.message);
    return true; // Fallback to allow redemptions if error occurs
  }

  if (!restaurant?.timezone) {
    console.error('No timezone set for restaurant:', restaurantId);
    return true; // Fallback to allow redemptions if no timezone set
  }

  // Get the current time in the restaurant's timezone
  const { currentTime, dayOfWeek } = getRestaurantLocalTime(restaurant.timezone);

  console.log('Restaurant timezone:', restaurant.timezone);
  console.log('Restaurant current time:', currentTime);
  console.log('Restaurant day of week:', dayOfWeek);
  console.log('Is takeaway order:', isTakeAway);

  // First check if the restaurant is open according to opening hours
  const openingHoursSchedule = Array.isArray(restaurant.opening_hours_schedule) 
    ? restaurant.opening_hours_schedule 
    : [];
  
  const openingHours = mapJsonToSchedule(openingHoursSchedule);
  const openingHoursForDay = openingHours.find(s => s.day_of_week === dayOfWeek);
  
  // If restaurant is closed according to opening hours, no redemptions allowed
  if (!isTimeWithinSchedule(currentTime, openingHoursForDay)) {
    console.log('Restaurant is closed according to opening hours');
    return false;
  }

  // Get the appropriate redemption schedule based on order type
  const redemptionSchedule = Array.isArray(restaurant.redemption_schedule) 
    ? restaurant.redemption_schedule 
    : [];
    
  const takeawaySchedule = Array.isArray(restaurant.takeaway_redemption_schedule) 
    ? restaurant.takeaway_redemption_schedule 
    : [];

  const scheduleData = getAppropriateSchedule(
    isTakeAway,
    restaurant.uses_same_redemption_schedule,
    redemptionSchedule,
    takeawaySchedule
  );

  // Find the redemption schedule for the current day
  const redemptionScheduleForDay = scheduleData.find(s => s.day_of_week === dayOfWeek);

  // Check if the current time is within the redemption schedule's hours
  return isTimeWithinSchedule(currentTime, redemptionScheduleForDay);
};
