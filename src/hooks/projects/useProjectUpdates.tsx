
import { toast } from '@/components/ui/use-toast';
import { Project, ProjectStatus, AuditLogEvent } from '@/types/project';
import {
  updateProjectStatus as updateProjectStatusUtil,
  updateProjectRating as updateProjectRatingUtil,
  addAuditLogEntry,
  setProjectArchived as setProjectArchivedUtil,
  updateInternalNotes as updateInternalNotesUtil,
  updateProjectVersion as updateProjectVersionUtil,
  updateProjectLanguage as updateProjectLanguageUtil,
  updateBrandName as updateBrandNameUtil,
  deleteProject as deleteProjectUtil
} from '@/utils/project';

export const useProjectUpdates = (
  projects: Project[],
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>,
  updateLocalStorage: (projects: Project[]) => void
) => {
  const updateProjectStatus = (id: string, status: ProjectStatus, comments?: string) => {
    const updatedProjects = updateProjectStatusUtil(projects, id, status, comments);
    
    setProjects(updatedProjects);
    updateLocalStorage(updatedProjects);
    
    const statusText = status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : status;
    toast({
      title: `Project ${statusText}`,
      description: `The project has been ${statusText} successfully`,
      variant: status === 'approved' ? 'default' : status === 'rejected' ? 'destructive' : 'default',
    });
  };

  const updateProjectRating = (id: string, rating: 1 | 2 | 3 | 4 | 5) => {
    const updatedProjects = updateProjectRatingUtil(projects, id, rating);
    
    setProjects(updatedProjects);
    updateLocalStorage(updatedProjects);
    
    toast({
      title: 'Rating submitted',
      description: 'Thank you for your feedback!',
    });
  };

  const addAuditLog = (id: string, event: Omit<AuditLogEvent, 'timestamp'>) => {
    const updatedProjects = addAuditLogEntry(projects, id, event);
    
    setProjects(updatedProjects);
    updateLocalStorage(updatedProjects);
  };

  const setProjectArchived = (id: string, archived: boolean) => {
    const updatedProjects = setProjectArchivedUtil(projects, id, archived);
    
    setProjects(updatedProjects);
    updateLocalStorage(updatedProjects);
    
    toast({
      title: archived ? 'Project archived' : 'Project restored',
      description: archived 
        ? 'The project has been moved to archives' 
        : 'The project has been restored from archives',
    });
  };

  const updateInternalNotes = (id: string, notes: string) => {
    const updatedProjects = updateInternalNotesUtil(projects, id, notes);
    
    setProjects(updatedProjects);
    updateLocalStorage(updatedProjects);
    
    toast({
      title: 'Notes updated',
      description: 'Internal notes have been saved',
    });
  };

  const updateProjectVersion = (id: string, version: number) => {
    const updatedProjects = updateProjectVersionUtil(projects, id, version);
    
    setProjects(updatedProjects);
    updateLocalStorage(updatedProjects);
    
    toast({
      title: 'Version updated',
      description: `Project version set to v${version}`,
    });
  };

  const updateProjectLanguage = (id: string, language: 'en' | 'de') => {
    const updatedProjects = updateProjectLanguageUtil(projects, id, language);
    
    setProjects(updatedProjects);
    updateLocalStorage(updatedProjects);
    
    toast({
      title: 'Language updated',
      description: `Project language set to ${language === 'en' ? 'English' : 'German'}`,
    });
  };

  const updateBrandName = (id: string, brandName: string) => {
    const updatedProjects = updateBrandNameUtil(projects, id, brandName);
    
    setProjects(updatedProjects);
    updateLocalStorage(updatedProjects);
    
    toast({
      title: 'Brand name updated',
      description: `Project brand name set to "${brandName}"`,
    });
  };

  const deleteProject = (id: string) => {
    const updatedProjects = deleteProjectUtil(projects, id);
    
    setProjects(updatedProjects);
    updateLocalStorage(updatedProjects);
    
    toast({
      title: 'Project deleted',
      description: 'The project has been permanently deleted',
      variant: 'destructive',
    });
  };

  return {
    updateProjectStatus,
    updateProjectRating,
    addAuditLog,
    setProjectArchived,
    updateInternalNotes,
    updateProjectVersion,
    updateProjectLanguage,
    updateBrandName,
    deleteProject
  };
};
