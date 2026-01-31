
import { DaySchedule } from "@/components/restaurant/schedule/DaySchedule";
import { Schedule } from "@/integrations/supabase/types/activity.types";

interface ScheduleSectionProps {
  title: string;
  schedule: Schedule[];
  onToggleDay: (day: string) => void;
  onTimeChange: (day: string, type: 'open_time' | 'close_time', value: string) => void;
}

export const ScheduleSection = ({ 
  title, 
  schedule, 
  onToggleDay, 
  onTimeChange 
}: ScheduleSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{title}</h3>
      <div className="space-y-6">
        {schedule.map((day) => (
          <DaySchedule
            key={`${title}-${day.day_of_week}`}
            day={day}
            onToggleDay={onToggleDay}
            onTimeChange={onTimeChange}
          />
        ))}
      </div>
    </div>
  );
};
