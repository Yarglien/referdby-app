
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TimeInput } from "@/components/TimeInput";
import { useTranslation } from 'react-i18next';

interface Schedule {
  day_of_week: string;
  is_open: boolean;
  open_time: string;
  close_time: string;
}

interface DayScheduleProps {
  day: Schedule;
  onToggleDay: (day: string) => void;
  onTimeChange: (day: string, type: 'open_time' | 'close_time', value: string) => void;
}

export const DaySchedule = ({ day, onToggleDay, onTimeChange }: DayScheduleProps) => {
  const { t } = useTranslation();
  
  const getDayName = (dayKey: string) => {
    const dayMap: Record<string, string> = {
      'Monday': t('days.monday'),
      'Tuesday': t('days.tuesday'), 
      'Wednesday': t('days.wednesday'),
      'Thursday': t('days.thursday'),
      'Friday': t('days.friday'),
      'Saturday': t('days.saturday'),
      'Sunday': t('days.sunday')
    };
    return dayMap[dayKey] || dayKey;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-lg">{getDayName(day.day_of_week)}</span>
        <Switch
          checked={day.is_open}
          onCheckedChange={() => onToggleDay(day.day_of_week)}
        />
      </div>
      {day.is_open && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t('restaurant.openFrom')}</Label>
            <TimeInput
              value={day.open_time}
              onChange={(value) => onTimeChange(day.day_of_week, 'open_time', value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('restaurant.closedAt')}</Label>
            <TimeInput
              value={day.close_time}
              onChange={(value) => onTimeChange(day.day_of_week, 'close_time', value)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
