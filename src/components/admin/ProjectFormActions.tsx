
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type ProjectFormActionsProps = {
  isSubmitting: boolean;
  onCancel: () => void;
};

const ProjectFormActions: React.FC<ProjectFormActionsProps> = ({
  isSubmitting,
  onCancel,
}) => {
  return (
    <div className="flex justify-end space-x-4 pt-6 border-t border-white/10">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
        className="border-white/10 hover:bg-white/10 text-designer-text-primary"
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button 
        type="submit" 
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating...
          </>
        ) : (
          'Create & Send Approval Link'
        )}
      </Button>
    </div>
  );
};

export default ProjectFormActions;
