import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const ThemeSelector = ({ form }: { form: any }) => {
  const { setTheme, theme: currentTheme, systemTheme } = useTheme();
  const { toast } = useToast();

  // Set initial theme from form value or system preference
  useEffect(() => {
    const initialTheme = form.getValues("theme") || "system";
    if (initialTheme && initialTheme !== currentTheme) {
      setTheme(initialTheme);
    }
  }, []);

  useEffect(() => {
    const subscription = form.watch(async (value: any) => {
      if (value.theme && value.theme !== currentTheme) {
        setTheme(value.theme);
        
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Update the theme preference in the database
        const { error } = await supabase
          .from('profiles')
          .update({ theme: value.theme })
          .eq('id', user.id);

        if (error) {
          console.error('Error updating theme:', error);
          toast({
            title: "Error",
            description: "Failed to save theme preference",
            variant: "destructive",
          });
        } else {
          console.log('Theme updated successfully:', value.theme);
          console.log('System theme is:', systemTheme);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form, setTheme, toast, currentTheme, systemTheme]);

  return (
    <FormField
      control={form.control}
      name="theme"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Theme Preference</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value || "system"}
              value={field.value}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light">Light</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="dark" />
                <Label htmlFor="dark">Dark</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="system" id="system" />
                <Label htmlFor="system">System</Label>
              </div>
            </RadioGroup>
          </FormControl>
        </FormItem>
      )}
    />
  );
};