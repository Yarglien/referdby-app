
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useRef } from "react";
import { PersonalInfoFields } from "./PersonalInfoFields";
import { ContactInfoFields } from "./ContactInfoFields";
import { PreferencesFields } from "./PreferencesFields";
import { FormActions } from "./FormActions";
import { PasswordSection } from "./PasswordSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  countryCode: z.string(),
  phoneNumber: z.string(),
  address: z.string(),
  address2: z.string().optional(),
  address3: z.string().optional(),
  homeCurrency: z.string().default("USD"),
  languagePreference: z.string().default("en"),
  theme: z.enum(["light", "dark", "system"]),
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
});

interface ProfileFormProps {
  profile: any;
  onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>;
  onLogout: () => Promise<void>;
}

export const ProfileForm = ({ profile, onSubmit, onLogout }: ProfileFormProps) => {
  const isInitialMount = useRef(true);
  const previousProfileId = useRef<string | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      countryCode: "+1",
      phoneNumber: "",
      address: "",
      address2: "",
      address3: "",
      homeCurrency: "USD",
      languagePreference: "en",
      theme: "light",
      emailNotifications: true,
      pushNotifications: true,
    },
  });

  // Only update form values when profile data actually changes (not on every render)
  useEffect(() => {
    if (profile && (isInitialMount.current || previousProfileId.current !== profile.id)) {
      console.log("Setting form values from profile:", profile);
      const formValues = {
        firstName: profile.first_name || "",
        lastName: profile.last_name || "",
        email: profile.email || "",
        countryCode: profile.country_code || "+1",
        phoneNumber: profile.mobile_number || "",
        address: profile.home_address_line1 || "",
        address2: profile.home_address_line2 || "",
        address3: profile.home_address_line3 || "",
        homeCurrency: profile.home_currency || "USD",
        languagePreference: profile.language_preference || "en",
        theme: (profile.theme as "light" | "dark" | "system") || "light",
        emailNotifications: profile.email_notifications !== false,
        pushNotifications: profile.push_notifications !== false,
      };
      console.log("Form values being set:", formValues);
      form.reset(formValues);
      
      isInitialMount.current = false;
      previousProfileId.current = profile.id;
    }
  }, [profile?.id, profile?.home_currency, profile?.language_preference, form]);

  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      
      <TabsContent value="profile">
        <Form {...form}>
          <form onSubmit={form.handleSubmit((values) => {
            console.log('=== FORM SUBMISSION STARTED ===');
            console.log('Form values received:', values);
            return onSubmit(values);
          })} className="space-y-6">
            <div className="space-y-4">
              <PersonalInfoFields form={form} />
              <ContactInfoFields form={form} />
              <PreferencesFields form={form} />
            </div>
            <FormActions onLogout={onLogout} />
          </form>
        </Form>
      </TabsContent>
      
      <TabsContent value="password">
        <PasswordSection />
      </TabsContent>
    </Tabs>
  );
};
