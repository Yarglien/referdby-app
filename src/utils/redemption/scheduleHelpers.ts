
import { format } from "date-fns";
import { toZonedTime } from 'date-fns-tz';
import { Schedule, JsonValue } from "@/integrations/supabase/types/activity.types";

/**
 * Converts a UTC date to a date in the restaurant's timezone
 */
export const getRestaurantLocalTime = (
  restaurantTimezone: string
): { currentTime: string; dayOfWeek: string; restaurantTime: Date } => {
  const utcDate = new Date();
  const restaurantTime = toZonedTime(utcDate, restaurantTimezone);
  const dayOfWeek = format(restaurantTime, 'EEEE'); // Returns full day name
  const currentTime = format(restaurantTime, 'HH:mm');

  return { currentTime, dayOfWeek, restaurantTime };
};

/**
 * Maps JSON schedule data to a strongly typed Schedule array
 */
export const mapJsonToSchedule = (scheduleJson: JsonValue[] | null): Schedule[] => {
  if (!scheduleJson || !Array.isArray(scheduleJson) || scheduleJson.length === 0) {
    return [];
  }

  return scheduleJson.map(schedule => ({
    day_of_week: (schedule as any).day_of_week || '',
    is_open: Boolean((schedule as any).is_open),
    open_time: (schedule as any).open_time || null,
    close_time: (schedule as any).close_time || null
  })) as Schedule[];
};

/**
 * Gets the appropriate schedule based on order type and restaurant settings
 */
export const getAppropriateSchedule = (
  isTakeaway: boolean,
  usesSameSchedule: boolean,
  dineInSchedule: JsonValue[] | null, 
  takeawaySchedule: JsonValue[] | null
): Schedule[] => {
  // If it's a takeaway order and restaurant has different schedules
  if (isTakeaway && !usesSameSchedule) {
    return mapJsonToSchedule(takeawaySchedule);
  } 
  
  // Use the regular redemption schedule for dine-in or when using same schedule
  return mapJsonToSchedule(dineInSchedule);
};

/**
 * Checks if the current time is within the schedule's open hours
 */
export const isTimeWithinSchedule = (
  currentTime: string, 
  daySchedule: Schedule | undefined
): boolean => {
  if (!daySchedule || !daySchedule.is_open) {
    return false;
  }

  const openTime = daySchedule.open_time?.slice(0, 5) || '00:00';
  const closeTime = daySchedule.close_time?.slice(0, 5) || '23:59';

  return currentTime >= openTime && currentTime <= closeTime;
};
