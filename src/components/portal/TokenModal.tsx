
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Key } from 'lucide-react';

// Translation content
const translations = {
  en: {
    enterToken: 'Enter Your Token',
    tokenRequired: 'Please enter the token you received by email',
    tokenPlaceholder: 'Enter token',
    submit: 'Submit'
  },
  de: {
    enterToken: 'Token eingeben',
    tokenRequired: 'Bitte geben Sie den Token ein, den Sie per E-Mail erhalten haben',
    tokenPlaceholder: 'Token eingeben',
    submit: 'Absenden'
  }
};

type TokenModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  token: string;
  setToken: (token: string) => void;
  tokenError: string;
  onSubmit: () => void;
  language?: 'en' | 'de';
};

const TokenModal: React.FC<TokenModalProps> = ({
  isOpen,
  onOpenChange,
  token,
  setToken,
  tokenError,
  onSubmit,
  language = 'en'
}) => {
  const t = translations[language];
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black/80 border-white/10 text-white">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-designer-badge/10 mb-2">
            <Key className="h-6 w-6 text-designer-badge" />
          </div>
          <DialogTitle className="text-center">{t.enterToken}</DialogTitle>
          <DialogDescription className="text-center text-designer-text-secondary">
            {t.tokenRequired}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder={t.tokenPlaceholder}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="bg-white/5 border-white/10 text-white"
          />
          
          {tokenError && (
            <p className="text-red-500 text-sm">{tokenError}</p>
          )}
          
          <Button type="submit" className="w-full">
            {t.submit}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TokenModal;
