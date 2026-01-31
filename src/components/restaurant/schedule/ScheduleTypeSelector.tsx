
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ScheduleTypeSelectorProps {
  usesSameSchedule: boolean;
  onChange: (isSame: boolean) => void;
}

export const ScheduleTypeSelector = ({ usesSameSchedule, onChange }: ScheduleTypeSelectorProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <Label className="text-base font-medium">Redemption Schedule</Label>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-sm text-muted-foreground">
              Use the same schedule for both Dine-In and Take-Away
            </p>
            <Switch 
              checked={usesSameSchedule}
              onCheckedChange={onChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
