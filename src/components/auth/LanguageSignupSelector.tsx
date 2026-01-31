import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
];

interface LanguageSignupSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
}

export const LanguageSignupSelector = ({ selectedLanguage, onLanguageChange }: LanguageSignupSelectorProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium text-center">{t('auth.selectLanguage')}</h3>
      <div className="grid grid-cols-2 gap-3">
        {languages.map((language) => (
          <Button
            key={language.code}
            variant={selectedLanguage === language.code ? "default" : "outline"}
            className={cn(
              "flex items-center gap-2 p-4 h-auto",
              selectedLanguage === language.code && "ring-2 ring-primary"
            )}
            onClick={() => onLanguageChange(language.code)}
          >
            <span className="text-2xl">{language.flag}</span>
            <span className="text-sm font-medium">{language.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};