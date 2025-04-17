
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';
import StarRating from '@/components/StarRating';

// Translation content
const translations = {
  en: {
    approveProject: 'Approve Project',
    rateExperience: 'How would you rate your experience?',
    yourRating: 'Your rating',
    cancel: 'Cancel',
    submit: 'Submit & Approve',
    submitting: 'Submitting...'
  },
  de: {
    approveProject: 'Projekt genehmigen',
    rateExperience: 'Wie würden Sie Ihre Erfahrung bewerten?',
    yourRating: 'Ihre Bewertung',
    cancel: 'Abbrechen',
    submit: 'Absenden & Genehmigen',
    submitting: 'Wird gesendet...'
  }
};

type RatingModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  rating: 1 | 2 | 3 | 4 | 5;
  setRating: (rating: 1 | 2 | 3 | 4 | 5) => void;
  onSubmit: () => void;
  language?: 'en' | 'de';
  isSubmitting?: boolean;
};

const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onOpenChange,
  rating,
  setRating,
  onSubmit,
  language = 'en',
  isSubmitting = false
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
            <Check className="h-6 w-6 text-designer-badge" />
          </div>
          <DialogTitle className="text-center">{t.approveProject}</DialogTitle>
          <DialogDescription className="text-center text-designer-text-secondary">
            {t.rateExperience}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-designer-text-secondary block mb-2">
              {t.yourRating}
            </label>
            <div className="flex justify-center">
              <StarRating rating={rating} onChange={setRating} />
            </div>
          </div>
          
          <DialogFooter className="gap-2 sm:space-x-0">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="border-white/10 hover:bg-white/10"
              disabled={isSubmitting}
            >
              {t.cancel}
            </Button>
            <Button 
              type="submit"
              className="bg-designer-badge hover:bg-designer-hover text-black font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t.submitting}
                </>
              ) : (
                t.submit
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RatingModal;
