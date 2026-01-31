
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";

interface ContactInfoFieldsProps {
  form: UseFormReturn<any>;
}

export const ContactInfoFields = ({ form }: ContactInfoFieldsProps) => {
  const { t } = useTranslation();
  
  return (
    <>
      <FormField
        control={form.control}
        name="countryCode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('profile.countryCode')}</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="phoneNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('profile.phone')}</FormLabel>
            <FormControl>
              <Input {...field} placeholder={t('profile.enterPhoneNumber')} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div>
        <Label>{t('profile.address')}</Label>
        <div className="space-y-2">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} placeholder={t('profile.addressLine1')} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address2"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} placeholder={t('profile.addressLine2')} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address3"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} placeholder={t('profile.addressLine3')} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </>
  );
};
