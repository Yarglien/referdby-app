import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UseFormReturn } from "react-hook-form";
import { SettingsFormValues } from "./SettingsForm";
import { useTranslation } from "react-i18next";
import { Ruler } from "lucide-react";

interface DistanceUnitSettingsProps {
  form: UseFormReturn<SettingsFormValues>;
}

export const DistanceUnitSettings = ({ form }: DistanceUnitSettingsProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Ruler className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">{t('settings.distanceUnit', 'Distance Unit')}</h3>
      </div>
      
      <FormField
        control={form.control}
        name="distanceUnit"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormDescription>
              {t('settings.distanceUnitDescription', 'Choose how distances are displayed throughout the app')}
            </FormDescription>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="flex flex-col space-y-2"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="miles" />
                  </FormControl>
                  <FormLabel className="font-normal cursor-pointer">
                    {t('settings.miles', 'Miles')} (mi)
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="km" />
                  </FormControl>
                  <FormLabel className="font-normal cursor-pointer">
                    {t('settings.kilometers', 'Kilometers')} (km)
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};
