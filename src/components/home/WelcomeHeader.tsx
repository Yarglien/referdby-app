import { PartialProfile } from "@/types/profile.types";
import { useTranslation } from 'react-i18next';
import { useTheme } from "next-themes";
import logoLight from "@/assets/referdby-logo-light.png";
import logoDark from "@/assets/referdby-logo-dark.png";

interface WelcomeHeaderProps {
  profile: PartialProfile | null;
}

export const WelcomeHeader = ({ profile }: WelcomeHeaderProps) => {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const isCustomer = profile?.role === 'customer' || profile?.role === undefined;
  
  const logo = resolvedTheme === 'dark' ? logoDark : logoLight;
  
  return (
    <div className="text-center">
      <img 
        src={logo} 
        alt="ReferdBy Logo" 
        className="h-16 w-auto mx-auto"
      />
      {isCustomer && (
        <p className="mt-1 text-muted-foreground">{t('home.tagline')}</p>
      )}
    </div>
  );
};
