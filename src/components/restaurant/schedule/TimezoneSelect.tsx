
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const TIMEZONES = [
  // GMT-12 to GMT-1
  { value: "Pacific/Wake", label: "GMT-12 (Wake Island)" },
  { value: "Pacific/Midway", label: "GMT-11 (Midway)" },
  { value: "Pacific/Honolulu", label: "GMT-10 (Honolulu)" },
  { value: "America/Anchorage", label: "GMT-9 (Anchorage)" },
  { value: "America/Los_Angeles", label: "GMT-8 (Los Angeles, Vancouver)" },
  { value: "America/Denver", label: "GMT-7 (Denver, Phoenix)" },
  { value: "America/Chicago", label: "GMT-6 (Chicago, Mexico City)" },
  { value: "America/New_York", label: "GMT-5 (New York, Toronto)" },
  { value: "America/Halifax", label: "GMT-4 (Halifax, Santo Domingo)" },
  { value: "America/Puerto_Rico", label: "GMT-4 (Puerto Rico, Caribbean)" },
  { value: "America/St_Johns", label: "GMT-3:30 (Newfoundland)" },
  { value: "America/Sao_Paulo", label: "GMT-3 (São Paulo, Buenos Aires)" },
  { value: "America/Noronha", label: "GMT-2 (Fernando de Noronha)" },
  { value: "Atlantic/Cape_Verde", label: "GMT-1 (Cape Verde)" },
  
  // GMT+0 to GMT+14
  { value: "Europe/London", label: "GMT+0 (London, Dublin)" },
  { value: "Europe/Paris", label: "GMT+1 (Paris, Berlin, Rome)" },
  { value: "Europe/Helsinki", label: "GMT+2 (Helsinki, Cairo)" },
  { value: "Europe/Moscow", label: "GMT+3 (Moscow, Istanbul)" },
  { value: "Asia/Dubai", label: "GMT+4 (Dubai, Baku)" },
  { value: "Asia/Kabul", label: "GMT+4:30 (Kabul)" },
  { value: "Asia/Karachi", label: "GMT+5 (Karachi, Tashkent)" },
  { value: "Asia/Kolkata", label: "GMT+5:30 (Mumbai, New Delhi)" },
  { value: "Asia/Kathmandu", label: "GMT+5:45 (Kathmandu)" },
  { value: "Asia/Dhaka", label: "GMT+6 (Dhaka, Almaty)" },
  { value: "Asia/Yangon", label: "GMT+6:30 (Yangon)" },
  { value: "Asia/Bangkok", label: "GMT+7 (Bangkok, Jakarta)" },
  { value: "Asia/Shanghai", label: "GMT+8 (Shanghai, Singapore)" },
  { value: "Asia/Pyongyang", label: "GMT+8:30 (Pyongyang)" },
  { value: "Asia/Tokyo", label: "GMT+9 (Tokyo, Seoul)" },
  { value: "Australia/Adelaide", label: "GMT+9:30 (Adelaide)" },
  { value: "Australia/Sydney", label: "GMT+10 (Sydney, Melbourne)" },
  { value: "Pacific/Guadalcanal", label: "GMT+11 (Solomon Islands)" },
  { value: "Pacific/Auckland", label: "GMT+12 (Auckland)" },
  { value: "Pacific/Chatham", label: "GMT+12:45 (Chatham Islands)" },
  { value: "Pacific/Tongatapu", label: "GMT+13 (Nuku'alofa)" },
  { value: "Pacific/Kiritimati", label: "GMT+14 (Kiritimati)" }
];

interface TimezoneSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export const TimezoneSelect = ({ value, onChange }: TimezoneSelectProps) => {
  return (
    <div className="space-y-4">
      <Label>Restaurant Timezone</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select timezone" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {TIMEZONES.map((tz) => (
            <SelectItem key={tz.value} value={tz.value}>
              {tz.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
