import { formatInTimeZone } from 'date-fns-tz';

interface Schedule {
  day_of_week: string;
  is_open: boolean;
  open_time: string | null;
  close_time: string | null;
}

interface ScheduleDisplayProps {
  title: string;
  schedule?: Schedule[];
  timezone: string | null;
}

export const ScheduleDisplay = ({ title, schedule, timezone }: ScheduleDisplayProps) => {
  const formatTime = (time: string | null) => {
    if (!time) return 'N/A';
    try {
      const [hours, minutes] = time.split(':');
      const formattedHours = parseInt(hours);
      const period = formattedHours >= 12 ? 'PM' : 'AM';
      const displayHours = formattedHours > 12 ? formattedHours - 12 : formattedHours === 0 ? 12 : formattedHours;
      return `${displayHours}:${minutes} ${period}`;
    } catch (e) {
      console.error('Error formatting time:', e);
      return 'N/A';
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      {schedule && schedule.length > 0 ? (
        <div className="space-y-1">
          {schedule.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span>{item.day_of_week}</span>
              <span className="text-muted-foreground">
                {item.is_open 
                  ? `${formatTime(item.open_time)} - ${formatTime(item.close_time)}`
                  : 'Closed'}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">Schedule has not been set up yet</p>
      )}
    </div>
  );
};