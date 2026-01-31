
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ThemeSettings } from "./ThemeSettings";
import { NotificationSettings } from "./NotificationSettings";
import { DangerZone } from "./DangerZone";
import { DistanceUnitSettings } from "./DistanceUnitSettings";

const formSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).default("system"),
  emailNotifications: z.boolean().default(false),
  pushNotifications: z.boolean().default(false),
  distanceUnit: z.enum(["miles", "km"]).default("miles"),
});

export type SettingsFormValues = z.infer<typeof formSchema>;

interface SettingsFormProps {
  initialValues: SettingsFormValues;
  userRole: string | null;
}

export const SettingsForm = ({ initialValues, userRole }: SettingsFormProps) => {
  const { toast } = useToast();
  
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  const handleSubmit = async (values: SettingsFormValues) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to update your settings",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          theme: values.theme,
          email_notifications: values.emailNotifications,
          push_notifications: values.pushNotifications,
          distance_unit: values.distanceUnit,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
            <ThemeSettings form={form} />
          </div>

          <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
            <DistanceUnitSettings form={form} />
          </div>
          
          <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
            <NotificationSettings form={form} />
          </div>

          <div className="flex justify-center mt-8">
            <Button 
              type="submit" 
              className="w-auto px-8 shadow-sm hover:shadow-md transition-shadow"
            >
              Save Settings
            </Button>
          </div>
        </form>
      </Form>
      
      <div className="bg-card/50 rounded-lg p-6 shadow-sm border border-border">
        <DangerZone userRole={userRole} />
      </div>
    </div>
  );
};
