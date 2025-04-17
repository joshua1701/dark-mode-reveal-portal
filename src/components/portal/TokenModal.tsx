
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
    submit: 'Submit',
    helpText: 'Need help? Visit cogswell.de'
  },
  de: {
    enterToken: 'Token eingeben',
    tokenRequired: 'Bitte geben Sie den Token ein, den Sie per E-Mail erhalten haben',
    tokenPlaceholder: 'Token eingeben',
    submit: 'Absenden',
    helpText: 'Brauchen Sie Hilfe? Besuchen Sie cogswell.de'
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

  if (!isOpen) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-designer-background text-white">
        <img 
          src="/lovable-uploads/b906aa0a-ce73-4a5d-bf54-a39b37f9e953.png" 
          alt="CogswellShare" 
          className="h-16 mb-6"
        />
        <div className="w-full max-w-md p-6 bg-black/80 border border-white/10 rounded-lg">
          <h1 className="text-2xl font-bold mb-4 text-center">{t.enterToken}</h1>
          <p className="text-designer-text-secondary mb-6 text-center">{t.tokenRequired}</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="proj-123:key-abc123"
              className="w-full p-3 bg-white/5 border border-white/10 rounded-md text-white"
            />
            
            {tokenError && (
              <p className="text-red-500 text-sm">{tokenError}</p>
            )}
            
            <Button 
              type="submit"
              className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-md transition-colors"
            >
              {t.submit}
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <a href="https://cogswell.de" target="_blank" rel="noopener noreferrer" className="text-designer-text-secondary underline hover:text-white">
              {t.helpText}
            </a>
          </div>
        </div>
      </div>
    );
  }

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
