
import { Schedule } from "@/integrations/supabase/types/activity.types";

export const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const DEFAULT_SCHEDULE: Schedule[] = DAYS_OF_WEEK.map(day => ({
  day_of_week: day,
  is_open: true,
  open_time: "00:00",
  close_time: "23:59"
}));

export const createUpdatedSchedule = (savedSchedule: Schedule[]): Schedule[] => {
  if (!Array.isArray(savedSchedule) || savedSchedule.length === 0) {
    return DEFAULT_SCHEDULE;
  }

  return DAYS_OF_WEEK.map(day => {
    const existingDay = savedSchedule.find(s => s.day_of_week === day);
    return existingDay ? {
      ...existingDay,
      is_open: Boolean(existingDay.is_open),
      open_time: existingDay.open_time || "00:00",
      close_time: existingDay.close_time || "23:59"
    } : {
      day_of_week: day,
      is_open: true,
      open_time: "00:00",
      close_time: "23:59"
    };
  });
};

export const updateScheduleDay = (
  schedule: Schedule[], 
  day: string, 
  updates: Partial<Schedule>
): Schedule[] => {
  return schedule.map(d => 
    d.day_of_week === day 
      ? { ...d, ...updates }
      : d
  );
};

export const calculateWeeklyHours = (schedule: Schedule[]): number => {
  return schedule.reduce((total, day) => {
    if (!day.is_open || !day.open_time || !day.close_time) {
      return total;
    }
    
    const [openHour, openMinute] = day.open_time.split(':').map(Number);
    const [closeHour, closeMinute] = day.close_time.split(':').map(Number);
    
    const openMinutes = openHour * 60 + openMinute;
    const closeMinutes = closeHour * 60 + closeMinute;
    
    // Handle case where closing time is next day (e.g., 02:00)
    const dailyMinutes = closeMinutes > openMinutes 
      ? closeMinutes - openMinutes 
      : (24 * 60) - openMinutes + closeMinutes;
    
    return total + (dailyMinutes / 60);
  }, 0);
};
