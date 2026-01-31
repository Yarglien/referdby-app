import {
  getRestaurantLocalTime,
  getAppropriateSchedule,
  isTimeWithinSchedule,
  mapJsonToSchedule
} from "./scheduleHelpers";

export interface RedemptionAvailability {
  dineIn: boolean;
  takeaway: boolean;
  message: string;
}

/**
 * Checks if redemptions are available today for both dine-in and takeaway
 */
export const checkRedemptionAvailability = (restaurant: any): RedemptionAvailability => {
  // If no timezone is set, assume not available
  if (!restaurant?.timezone) {
    return {
      dineIn: false,
      takeaway: false,
      message: "Availability unknown"
    };
  }

  // Get the current time in the restaurant's timezone
  const { currentTime, dayOfWeek } = getRestaurantLocalTime(restaurant.timezone);

  // First check if the restaurant is open according to opening hours
  const openingHoursSchedule = Array.isArray(restaurant.opening_hours_schedule) 
    ? restaurant.opening_hours_schedule 
    : [];
  
  const openingHours = mapJsonToSchedule(openingHoursSchedule);
  const openingHoursForDay = openingHours.find(s => s.day_of_week === dayOfWeek);
  
  // If restaurant is closed according to opening hours, no redemptions allowed
  if (!isTimeWithinSchedule(currentTime, openingHoursForDay)) {
    return {
      dineIn: false,
      takeaway: false,
      message: "Restaurant is closed today"
    };
  }

  // Get the redemption schedules
  const redemptionSchedule = Array.isArray(restaurant.redemption_schedule) 
    ? restaurant.redemption_schedule 
    : [];
    
  const takeawaySchedule = Array.isArray(restaurant.takeaway_redemption_schedule) 
    ? restaurant.takeaway_redemption_schedule 
    : [];

  // Check dine-in availability
  const dineInScheduleData = getAppropriateSchedule(
    false, // dine-in
    restaurant.uses_same_redemption_schedule,
    redemptionSchedule,
    takeawaySchedule
  );
  const dineInScheduleForDay = dineInScheduleData.find(s => s.day_of_week === dayOfWeek);
  const dineInAvailable = isTimeWithinSchedule(currentTime, dineInScheduleForDay);

  // Check takeaway availability
  const takeawayScheduleData = getAppropriateSchedule(
    true, // takeaway
    restaurant.uses_same_redemption_schedule,
    redemptionSchedule,
    takeawaySchedule
  );
  const takeawayScheduleForDay = takeawayScheduleData.find(s => s.day_of_week === dayOfWeek);
  const takeawayAvailable = isTimeWithinSchedule(currentTime, takeawayScheduleForDay);

  // Generate message based on availability
  let message = "";
  if (dineInAvailable && takeawayAvailable) {
    message = "Dine in and Takeaway Redemptions are available today";
  } else if (dineInAvailable) {
    message = "Take out redemptions are not available today, Dine in redemptions are available";
  } else if (takeawayAvailable) {
    message = "Dine in redemptions are not available today, Take out redemptions are available";
  } else {
    message = "Redemptions are not available at this restaurant today";
  }

  return {
    dineIn: dineInAvailable,
    takeaway: takeawayAvailable,
    message
  };
};