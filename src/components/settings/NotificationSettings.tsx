
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface NotificationSettingsProps {
  form: any;
}

export const NotificationSettings = ({ form }: NotificationSettingsProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold border-b pb-2">Notification Preferences</h2>
      
      <div className="flex items-center justify-between p-3 rounded-md bg-accent/10 hover:bg-accent/20 transition-colors">
        <Label htmlFor="emailNotifications" className="font-medium">Email Notifications</Label>
        <Switch 
          id="emailNotifications"
          checked={form.watch("emailNotifications")}
          onCheckedChange={(checked) => form.setValue("emailNotifications", checked)}
          className="data-[state=checked]:bg-primary"
        />
      </div>

      <div className="flex items-center justify-between p-3 rounded-md bg-accent/10 hover:bg-accent/20 transition-colors">
        <Label htmlFor="pushNotifications" className="font-medium">Push Notifications</Label>
        <Switch 
          id="pushNotifications"
          checked={form.watch("pushNotifications")}
          onCheckedChange={(checked) => form.setValue("pushNotifications", checked)}
          className="data-[state=checked]:bg-primary"
        />
      </div>
    </div>
  );
};
