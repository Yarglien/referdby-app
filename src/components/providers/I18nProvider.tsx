import { ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUser } from '@/contexts/UserContext';

interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider = ({ children }: I18nProviderProps) => {
  const { i18n } = useTranslation();
  const { profile } = useUser();

  // Set language from user profile when available
  useEffect(() => {
    console.log('I18nProvider: Profile language preference:', profile?.language_preference);
    console.log('I18nProvider: Current i18n language:', i18n.language);
    
    if (profile?.language_preference) {
      console.log('I18nProvider: Setting language to:', profile.language_preference);
      i18n.changeLanguage(profile.language_preference).then(() => {
        console.log('I18nProvider: Language successfully changed to:', profile.language_preference);
      }).catch(error => {
        console.error('I18nProvider: Error changing language:', error);
      });
    } else if (!profile?.language_preference && profile) {
      // If no language preference set but profile exists, default to English
      console.log('I18nProvider: No language preference, defaulting to English');
      i18n.changeLanguage('en');
    }
  }, [profile?.language_preference, i18n]);

  return <>{children}</>;
};