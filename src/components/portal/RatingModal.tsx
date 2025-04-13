
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import StarRating from '@/components/StarRating';
import { ThumbsUp } from 'lucide-react';

type RatingModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  rating: 1 | 2 | 3 | 4 | 5;
  setRating: (rating: 1 | 2 | 3 | 4 | 5) => void;
  onSubmit: () => void;
};

const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onOpenChange,
  rating,
  setRating,
  onSubmit
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black/80 border-white/10 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rate This Project</DialogTitle>
          <DialogDescription className="text-designer-text-secondary">
            How would you rate your satisfaction with this design?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-6">
          <div className="flex justify-center">
            <StarRating rating={rating} onChange={setRating} size="lg" />
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={onSubmit}
            className="bg-designer-badge hover:bg-designer-hover text-black font-semibold"
          >
            <ThumbsUp className="mr-2 h-4 w-4" />
            Submit & Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RatingModal;
