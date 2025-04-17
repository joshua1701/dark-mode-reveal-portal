
import { useProjectCore } from './useProjectCore';
import { useProjectCreation } from './useProjectCreation';
import { useProjectQueries } from './useProjectQueries';
import { useProjectUpdates } from './useProjectUpdates';
import { useProjectEmails } from './useProjectEmails';
import { ProjectContextType } from '@/context/ProjectContextType';

export const useProjectProvider = (): ProjectContextType => {
  const { projects, setProjects, loading, error, updateLocalStorage } = useProjectCore();
  
  const { addProject } = useProjectCreation(projects, setProjects, updateLocalStorage);
  
  const { getProject, getProjectByIdAndKey } = useProjectQueries(projects);
  
  const {
    updateProjectStatus,
    updateProjectRating,
    addAuditLog,
    setProjectArchived,
    updateInternalNotes,
    updateProjectVersion,
    updateProjectLanguage,
    updateBrandName,
    deleteProject
  } = useProjectUpdates(projects, setProjects, updateLocalStorage);
  
  const { sendReminderEmail } = useProjectEmails(
    projects, 
    setProjects, 
    updateLocalStorage, 
    getProject
  );

  return { 
    projects, 
    loading, 
    error, 
    addProject, 
    getProject, 
    getProjectByIdAndKey,
    updateProjectStatus,
    updateProjectRating,
    addAuditLog,
    setProjectArchived,
    updateInternalNotes,
    updateProjectVersion,
    updateProjectLanguage,
    updateBrandName,
    sendReminderEmail,
    deleteProject
  };
};

export * from './useProjectCore';
export * from './useProjectCreation';
export * from './useProjectQueries';
export * from './useProjectUpdates';
export * from './useProjectEmails';
