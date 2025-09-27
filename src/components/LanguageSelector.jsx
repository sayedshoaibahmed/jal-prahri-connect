import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const LanguageSelector = () => {
  const { currentLanguage, changeLanguage, getAvailableLanguages } = useLanguage();
  const availableLanguages = getAvailableLanguages();
  const currentLangName = availableLanguages.find(lang => lang.code === currentLanguage)?.name;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
        >
          <Globe className="h-4 w-4" />
          <span className="sr-only">Select language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-40 bg-background border border-border shadow-lg"
        sideOffset={4}
      >
        {availableLanguages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={`cursor-pointer ${
              currentLanguage === language.code 
                ? 'bg-accent text-accent-foreground' 
                : 'hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <span className="text-sm font-medium">{language.name}</span>
            {currentLanguage === language.code && (
              <span className="ml-auto text-xs">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;