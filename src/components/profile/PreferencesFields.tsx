
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { SUPPORTED_CURRENCIES } from "@/utils/currencyUtils";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useTranslation } from "react-i18next";

interface PreferencesFieldsProps {
  form: UseFormReturn<any>;
}

export const PreferencesFields = ({ form }: PreferencesFieldsProps) => {
  const { t } = useTranslation();
  
  return (
    <>
      <FormField
        control={form.control}
        name="languagePreference"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('profile.language')}</FormLabel>
            <FormControl>
              <LanguageSelector
                value={field.value}
                onValueChange={(value) => {
                  console.log("Language changed to:", value);
                  field.onChange(value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="homeCurrency"
        render={({ field }) => {
          console.log("Currency field value:", field.value);
          return (
            <FormItem>
              <FormLabel>{t('profile.currency')}</FormLabel>
              <FormControl>
                <Select 
                  value={field.value} 
                  onValueChange={(value) => {
                    console.log("Currency changed to:", value);
                    field.onChange(value);
                    form.setValue("homeCurrency", value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('profile.selectHomeCurrency')} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] overflow-y-auto">
                    {SUPPORTED_CURRENCIES.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    </>
  );
};
