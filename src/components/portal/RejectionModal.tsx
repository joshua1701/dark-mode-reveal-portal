
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';

// Translation content
const translations = {
  en: {
    requestChanges: 'Request Changes',
    provideDetails: 'Please provide details about the changes you need',
    yourFeedback: 'Your feedback',
    cancel: 'Cancel',
    submit: 'Submit Feedback'
  },
  de: {
    requestChanges: 'Änderungen anfordern',
    provideDetails: 'Bitte geben Sie Details zu den gewünschten Änderungen an',
    yourFeedback: 'Ihr Feedback',
    cancel: 'Abbrechen',
    submit: 'Feedback senden'
  }
};

type RejectionModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  rejectionReason: string;
  setRejectionReason: (reason: string) => void;
  onSubmit: () => void;
  language?: 'en' | 'de';
};

const RejectionModal: React.FC<RejectionModalProps> = ({
  isOpen,
  onOpenChange,
  rejectionReason,
  setRejectionReason,
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
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 mb-2">
            <X className="h-6 w-6 text-red-500" />
          </div>
          <DialogTitle className="text-center">{t.requestChanges}</DialogTitle>
          <DialogDescription className="text-center text-designer-text-secondary">
            {t.provideDetails}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-designer-text-secondary block mb-2">
              {t.yourFeedback}
            </label>
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="bg-white/5 border-white/10 text-white min-h-[120px]"
              required
            />
          </div>
          
          <DialogFooter className="gap-2 sm:space-x-0">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="border-white/10 hover:bg-white/10"
            >
              {t.cancel}
            </Button>
            <Button 
              type="submit"
              className="bg-red-500 hover:bg-red-600"
            >
              {t.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RejectionModal;
