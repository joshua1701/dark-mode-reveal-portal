
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

type RejectionModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  rejectionReason: string;
  setRejectionReason: (reason: string) => void;
  onSubmit: () => void;
};

const RejectionModal: React.FC<RejectionModalProps> = ({
  isOpen,
  onOpenChange,
  rejectionReason,
  setRejectionReason,
  onSubmit
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black/80 border-white/10 text-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Provide Feedback</DialogTitle>
          <DialogDescription className="text-designer-text-secondary">
            Please let us know why you're rejecting this design and what changes you'd like to see.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Textarea
            placeholder="Enter your feedback here..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="min-h-[120px] bg-white/5 border-white/10 text-white"
          />
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-white/10 hover:bg-white/10">
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={onSubmit}
            disabled={!rejectionReason.trim()}
          >
            Submit Rejection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RejectionModal;
