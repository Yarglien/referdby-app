import { Schedule } from "@/integrations/supabase/types/activity.types";

export const getTodaySchedule = (schedule: Schedule[]): Schedule | null => {
  if (!schedule || schedule.length === 0) return null;
  
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  return schedule.find(s => s.day_of_week === today) || null;
};

export const formatScheduleTime = (time: string | null): string => {
  if (!time) return 'N/A';
  try {
    const [hours, minutes] = time.split(':');
    const formattedHours = parseInt(hours);
    const period = formattedHours >= 12 ? 'PM' : 'AM';
    const displayHours = formattedHours > 12 ? formattedHours - 12 : formattedHours === 0 ? 12 : formattedHours;
    return `${displayHours}:${minutes} ${period}`;
  } catch (e) {
    return 'N/A';
  }
};

export const formatTodaySchedule = (schedule: Schedule[]): string => {
  const todaySchedule = getTodaySchedule(schedule);
  if (!todaySchedule) return 'No schedule';
  
  if (!todaySchedule.is_open) return 'Closed today';
  
  return `${formatScheduleTime(todaySchedule.open_time)} - ${formatScheduleTime(todaySchedule.close_time)}`;
};