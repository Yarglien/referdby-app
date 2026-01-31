import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
];

interface LanguageSelectorProps {
  value?: string;
  onValueChange?: (language: string) => void;
  className?: string;
}

export const LanguageSelector = ({ value, onValueChange, className }: LanguageSelectorProps) => {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  
  const currentLanguage = value || i18n.language || 'en';
  const selectedLanguage = languages.find(lang => lang.code === currentLanguage) || languages[0];

  const handleLanguageChange = (languageCode: string) => {
    if (onValueChange) {
      onValueChange(languageCode);
    } else {
      i18n.changeLanguage(languageCode);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{selectedLanguage.flag}</span>
            <span>{selectedLanguage.name}</span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <div className="max-h-[300px] overflow-auto">
          {languages.map((language) => (
            <Button
              key={language.code}
              variant="ghost"
              className="w-full justify-start gap-2 h-10"
              onClick={() => handleLanguageChange(language.code)}
            >
              <span className="text-lg">{language.flag}</span>
              <span className="flex-1 text-left">{language.name}</span>
              {currentLanguage === language.code && (
                <Check className="h-4 w-4" />
              )}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};