import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthHandlers } from "./useAuthHandlers";
import { LanguageSignupSelector } from "./LanguageSignupSelector";
import { useTranslation } from "react-i18next";

interface CustomSignupFormProps {
  inviteCode: string | null;
  inviteType: string | null;
  onSuccess: () => void;
  onError: (error: any) => void;
}

export const CustomSignupForm = ({ inviteCode, inviteType, onSuccess, onError }: CustomSignupFormProps) => {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || 'en');
  const { isLoading, handleSubmit } = useAuthHandlers(inviteCode, inviteType);

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    i18n.changeLanguage(language);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const success = await handleSubmit({ email, password });
      if (success) {
        onSuccess();
      }
    } catch (error) {
      onError(error);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <LanguageSignupSelector 
        selectedLanguage={selectedLanguage}
        onLanguageChange={handleLanguageChange}
      />
      
      <div className="space-y-2">
        <Label htmlFor="email" className="text-foreground">{t('auth.email')}</Label>
        <Input
          id="email"
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-background border-border text-foreground"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password" className="text-foreground">{t('auth.password')}</Label>
        <Input
          id="password"
          type="password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="bg-background border-border text-foreground"
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        disabled={isLoading}
      >
        {isLoading ? t('common.loading') : t('auth.signUp')}
      </Button>
      
      <p className="text-xs text-muted-foreground text-center">
        You are signing up as a {inviteType} with invite code: {inviteCode?.slice(0, 8)}...
      </p>
    </form>
  );
};