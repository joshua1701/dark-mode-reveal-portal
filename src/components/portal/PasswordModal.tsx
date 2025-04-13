
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type PasswordModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  password: string;
  setPassword: (password: string) => void;
  passwordError: string;
  onSubmit: () => void;
};

const PasswordModal: React.FC<PasswordModalProps> = ({
  isOpen,
  onOpenChange,
  password,
  setPassword,
  passwordError,
  onSubmit
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black/80 border-white/10 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Password Required</DialogTitle>
          <DialogDescription className="text-designer-text-secondary">
            Enter the password provided by your designer to view this project.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Input
            placeholder="Enter password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-white/5 border-white/10 text-white"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSubmit();
              }
            }}
          />
          {passwordError && <p className="text-red-400 text-sm">{passwordError}</p>}
        </div>
        <DialogFooter>
          <Button onClick={onSubmit}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordModal;
