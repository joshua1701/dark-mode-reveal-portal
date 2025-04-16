
import React from 'react';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type LanguageSwitcherProps = {
  currentLanguage: 'en' | 'de';
  onLanguageChange: (language: 'en' | 'de') => void;
};

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  currentLanguage,
  onLanguageChange,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-9 p-0 bg-black/30 border-white/10 hover:bg-white/10"
        >
          <Globe className="h-4 w-4" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-black/80 border-white/10">
        <DropdownMenuItem
          className={`cursor-pointer ${currentLanguage === 'en' ? 'bg-white/10' : ''}`}
          onClick={() => onLanguageChange('en')}
        >
          <span className="mr-2">🇺🇸</span> English
        </DropdownMenuItem>
        <DropdownMenuItem
          className={`cursor-pointer ${currentLanguage === 'de' ? 'bg-white/10' : ''}`}
          onClick={() => onLanguageChange('de')}
        >
          <span className="mr-2">🇩🇪</span> Deutsch
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
