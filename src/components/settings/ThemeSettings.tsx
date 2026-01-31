
import { ThemeSelector } from "@/components/ThemeSelector";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";

interface ThemeSettingsProps {
  form: any;
}

export const ThemeSettings = ({ form }: ThemeSettingsProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold border-b pb-2">Theme</h2>
      <div className="p-3 rounded-md bg-accent/10">
        <ThemeSelector form={form} />
      </div>
    </div>
  );
};
