
import { toast } from '@/components/ui/use-toast';
import { Project } from '@/types/project';

export const useProjectManagement = (
  projects: Project[],
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>
) => {
  const setProjectArchived = async (id: string, archived: boolean) => {
    try {
      // Update local state
      const updatedProjects = projects.map(project => {
        if (project.id === id) {
          return { ...project, archived };
        }
        return project;
      });
      
      setProjects(updatedProjects);
      
      // Also update localStorage
      localStorage.setItem('designer_portal_projects', JSON.stringify(updatedProjects));
      
      toast({
        title: archived ? 'Project archived' : 'Project restored',
        description: archived 
          ? 'The project has been moved to archives' 
          : 'The project has been restored from archives',
      });
    } catch (error: any) {
      console.error('Error in setProjectArchived:', error);
      toast({
        title: 'Archive Update Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
    }
  };

  const updateInternalNotes = async (id: string, notes: string) => {
    try {
      // Update local state
      const updatedProjects = projects.map(project => {
        if (project.id === id) {
          return { ...project, internalNotes: notes };
        }
        return project;
      });
      
      setProjects(updatedProjects);
      
      // Also update localStorage
      localStorage.setItem('designer_portal_projects', JSON.stringify(updatedProjects));
      
      toast({
        title: 'Notes updated',
        description: 'Internal notes have been saved',
      });
    } catch (error: any) {
      console.error('Error in updateInternalNotes:', error);
      toast({
        title: 'Notes Update Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
    }
  };

  const updateProjectVersion = async (id: string, version: number) => {
    try {
      // Update local state
      const updatedProjects = projects.map(project => {
        if (project.id === id) {
          return { ...project, version };
        }
        return project;
      });
      
      setProjects(updatedProjects);
      
      // Also update localStorage
      localStorage.setItem('designer_portal_projects', JSON.stringify(updatedProjects));
      
      toast({
        title: 'Version updated',
        description: `Project version set to v${version}`,
      });
    } catch (error: any) {
      console.error('Error in updateProjectVersion:', error);
      toast({
        title: 'Version Update Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
    }
  };

  const updateProjectLanguage = async (id: string, language: 'en' | 'de') => {
    try {
      // Update local state
      const updatedProjects = projects.map(project => {
        if (project.id === id) {
          return { ...project, language };
        }
        return project;
      });
      
      setProjects(updatedProjects);
      
      // Also update localStorage
      localStorage.setItem('designer_portal_projects', JSON.stringify(updatedProjects));
      
      toast({
        title: 'Language updated',
        description: `Project language set to ${language === 'en' ? 'English' : 'German'}`,
      });
    } catch (error: any) {
      console.error('Error in updateProjectLanguage:', error);
      toast({
        title: 'Language Update Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
    }
  };

  const updateBrandName = async (id: string, brandName: string) => {
    try {
      // Update local state
      const updatedProjects = projects.map(project => {
        if (project.id === id) {
          return { ...project, brandName };
        }
        return project;
      });
      
      setProjects(updatedProjects);
      
      // Also update localStorage
      localStorage.setItem('designer_portal_projects', JSON.stringify(updatedProjects));
      
      toast({
        title: 'Brand name updated',
        description: `Project brand name set to "${brandName}"`,
      });
    } catch (error: any) {
      console.error('Error in updateBrandName:', error);
      toast({
        title: 'Brand Name Update Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
    }
  };

  const deleteProject = async (id: string) => {
    try {
      // Update local state
      const updatedProjects = projects.filter(project => project.id !== id);
      setProjects(updatedProjects);
      
      // Also update localStorage
      localStorage.setItem('designer_portal_projects', JSON.stringify(updatedProjects));
      
      toast({
        title: 'Project deleted',
        description: 'The project has been permanently deleted',
        variant: 'destructive',
      });
    } catch (error: any) {
      console.error('Error in deleteProject:', error);
      toast({
        title: 'Delete Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
    }
  };

  return {
    setProjectArchived,
    updateInternalNotes,
    updateProjectVersion,
    updateProjectLanguage,
    updateBrandName,
    deleteProject
  };
};
