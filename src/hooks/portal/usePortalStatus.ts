
import { Project, ProjectStatus } from '@/types/project';
import { useProjects } from '@/context/ProjectContext';
import { toast } from '@/components/ui/use-toast';

export const usePortalStatus = (
  portalCore: ReturnType<typeof import('./usePortalCore').usePortalCore>
) => {
  const { 
    project, 
    setProject, 
    isSubmitting, 
    setIsSubmitting, 
    language, 
    setIsRejectModalOpen,
    setShowRatingModal 
  } = portalCore;

  const { updateProjectStatus, updateProjectRating } = useProjects();

  const handleStatusChange = (status: ProjectStatus) => {
    if (!project) return;
    
    if (status === 'rejected') {
      setIsRejectModalOpen(true);
    } else {
      setShowRatingModal(true);
    }
  };
  
  const handleReject = (rejectionReason: string) => {
    if (!project || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      updateProjectStatus(project.id, 'rejected', rejectionReason);
      
      toast({
        title: language === 'en' ? 'Project Rejected' : 'Projekt abgelehnt',
        description: language === 'en' ? 
          'Feedback has been submitted' : 
          'Feedback wurde übermittelt',
        variant: 'destructive',
      });
      
      setProject({
        ...project,
        status: 'rejected',
        comments: rejectionReason
      });
    } catch (error) {
      console.error('Error rejecting project:', error);
      toast({
        title: 'Error',
        description: 'Failed to update project status',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setIsRejectModalOpen(false);
    }
  };
  
  const handleRatingSubmit = (rating: 1 | 2 | 3 | 4 | 5) => {
    if (!project || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      updateProjectRating(project.id, rating);
      updateProjectStatus(project.id, 'approved');
      
      toast({
        title: language === 'en' ? 'Project Approved' : 'Projekt genehmigt',
        description: language === 'en' ? 
          'Thank you for your approval!' : 
          'Vielen Dank für Ihre Genehmigung!',
      });
      
      setProject({
        ...project,
        status: 'approved',
        customerRating: rating
      });
    } catch (error) {
      console.error('Error approving project:', error);
      toast({
        title: 'Error',
        description: 'Failed to update project status',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setShowRatingModal(false);
    }
  };

  return {
    handleStatusChange,
    handleReject,
    handleRatingSubmit
  };
};
