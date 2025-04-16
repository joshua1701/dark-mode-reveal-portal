
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock } from 'lucide-react';

// Translation content
const translations = {
  en: {
    passwordProtected: 'Password Protected',
    passwordRequired: 'This project requires a password to view',
    enterPassword: 'Enter password',
    submit: 'Submit'
  },
  de: {
    passwordProtected: 'Passwortgeschützt',
    passwordRequired: 'Dieses Projekt erfordert ein Passwort zum Anzeigen',
    enterPassword: 'Passwort eingeben',
    submit: 'Absenden'
  }
};

type PasswordModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  password: string;
  setPassword: (password: string) => void;
  passwordError: string;
  onSubmit: () => void;
  language?: 'en' | 'de';
};

const PasswordModal: React.FC<PasswordModalProps> = ({
  isOpen,
  onOpenChange,
  password,
  setPassword,
  passwordError,
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
            <Lock className="h-6 w-6 text-designer-badge" />
          </div>
          <DialogTitle className="text-center">{t.passwordProtected}</DialogTitle>
          <DialogDescription className="text-center text-designer-text-secondary">
            {t.passwordRequired}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder={t.enterPassword}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-white/5 border-white/10 text-white"
          />
          
          {passwordError && (
            <p className="text-red-500 text-sm">{passwordError}</p>
          )}
          
          <Button type="submit" className="w-full">
            {t.submit}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordModal;
