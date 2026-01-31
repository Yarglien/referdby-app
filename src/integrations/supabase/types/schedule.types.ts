
import { JsonValue } from './activity.types';

export interface Schedule {
  day_of_week: string;
  is_open: boolean;
  open_time: string | null;
  close_time: string | null;
  [key: string]: JsonValue;
}

export interface ScheduleDisplayProps {
  title: string;
  schedule?: Schedule[];
  timezone: string | null;
}
